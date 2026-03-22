import prisma from '../config/database.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import storageProvider, { ACCESS_TYPES, STORAGE_BUCKETS } from '../storage/index.js';
import { getPreviewAccessUrl } from '../utils/storageUrl.js';

const resolutionFieldMap = {
  HD: {
    single: 'originalFileHD',
    bundle: 'bundleOriginalsHD',
    price: 'priceHD',
  },
  FULL_HD: {
    single: 'originalFileFullHD',
    bundle: 'bundleOriginalsFullHD',
    price: 'priceFullHD',
  },
  FOUR_K: {
    single: 'originalFile4K',
    bundle: 'bundleOriginals4K',
    price: 'price4K',
  },
};

const normalizeResolution = (resolution) => {
  const normalized = String(resolution || '')
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();

  if (normalized === '4K' || normalized === 'FOURK') {
    return 'FOUR_K';
  }

  if (normalized === 'FULLHD' || normalized === 'FHD') {
    return 'FULL_HD';
  }

  return normalized;
};

const formatResolutionForDisplay = (resolution) => {
  const normalized = normalizeResolution(resolution);
  if (normalized === 'FULL_HD') return 'Full HD';
  if (normalized === 'FOUR_K') return '4K';
  if (normalized === 'HD') return 'HD';
  return normalized.replace(/_/g, ' ');
};
const PAYMENT_CURRENCY = process.env.PAYMENT_CURRENCY || 'INR';

function verifyRazorpayPaymentSignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expectedSignature === signature;
}

function verifyRazorpayWebhookSignature(rawBody, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  }

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return expected === signature;
}

async function getSignedAccessDuration() {
  const config = await prisma.siteConfig.findFirst({
    select: { signedUrlDuration: true },
  });

  const duration = Number.parseInt(config?.signedUrlDuration, 10);
  return Number.isFinite(duration) && duration > 0 ? duration : 3600;
}

async function createPaymentEvent(eventData) {
  try {
    const created = await prisma.paymentEvent.create({
      data: eventData,
    });

    return { record: created, duplicate: false };
  } catch (error) {
    if (error.code === 'P2002' && eventData.eventId) {
      const existing = await prisma.paymentEvent.findUnique({
        where: { eventId: eventData.eventId },
      });
      return { record: existing, duplicate: true };
    }
    throw error;
  }
}

async function markOrderAsPaid({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const signedDuration = await getSignedAccessDuration();
  const accessStart = new Date();
  const accessExpiry = new Date(accessStart.getTime() + signedDuration * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findFirst({
      where: orderId ? { id: orderId } : { razorpayOrderId },
      include: {
        items: true,
      },
    });

    if (!existingOrder) {
      return { notFound: true };
    }

    if (razorpayOrderId && existingOrder.razorpayOrderId !== razorpayOrderId) {
      return { mismatch: true, order: existingOrder };
    }

    if (existingOrder.status === 'COMPLETED') {
      return { alreadyProcessed: true, order: existingOrder };
    }

    const updated = await tx.order.updateMany({
      where: {
        id: existingOrder.id,
        status: { not: 'COMPLETED' },
      },
      data: {
        status: 'COMPLETED',
        paymentId: razorpayPaymentId,
        razorpayPaymentId,
        razorpaySignature,
      },
    });

    if (updated.count === 0) {
      const completedOrder = await tx.order.findUnique({
        where: { id: existingOrder.id },
        include: { items: true },
      });
      return { alreadyProcessed: true, order: completedOrder };
    }

    await tx.orderItem.updateMany({
      where: { orderId: existingOrder.id },
      data: {
        accessStartTime: accessStart,
        accessExpiryTime: accessExpiry,
      },
    });

    const uniqueProductIds = [...new Set(existingOrder.items.map((item) => item.productId))];
    await Promise.all(
      uniqueProductIds.map((productId) =>
        tx.product.update({
          where: { id: productId },
          data: {
            popularity: { increment: 1 },
          },
        })
      )
    );

    await tx.cartItem.deleteMany({
      where: { userId: existingOrder.userId },
    });

    const finalizedOrder = await tx.order.findUnique({
      where: { id: existingOrder.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return {
      alreadyProcessed: false,
      order: finalizedOrder,
      accessStart,
      accessExpiry,
      signedDuration,
    };
  });

  return result;
}

export const createOrder = async (req, res, next) => {
  try {
    const { paymentMethod = 'RAZORPAY' } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty',
      });
    }

    const pricedItems = cartItems.map((item) => {
      const normalizedResolution = normalizeResolution(item.resolution);
      const mapping = resolutionFieldMap[normalizedResolution];

      if (!mapping) {
        throw new Error(`Unsupported resolution in cart: ${item.resolution}`);
      }

      if (item.product.status !== 'ACTIVE') {
        const error = new Error(`Product "${item.product.title}" is not available`);
        error.statusCode = 400;
        throw error;
      }

      const price = Number(item.product[mapping.price]);
      if (!Number.isFinite(price) || price <= 0) {
        const error = new Error(
          `Invalid ${formatResolutionForDisplay(normalizedResolution)} price for "${item.product.title}"`
        );
        error.statusCode = 400;
        throw error;
      }

      return {
        productId: item.productId,
        resolution: normalizedResolution,
        price,
      };
    });

    const total = pricedItems.reduce((sum, item) => sum + item.price, 0);
    const receipt = `order_${req.user.userId}_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: PAYMENT_CURRENCY,
      receipt,
      payment_capture: 1,
    });

    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        total,
        status: 'PENDING',
        paymentMethod: String(paymentMethod).toUpperCase(),
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: pricedItems,
        },
      },
    });

    await createPaymentEvent({
      eventType: 'payment.order.created',
      orderId: order.id,
      status: 'CREATED',
      payload: {
        userId: req.user.userId,
        amount: total,
        currency: PAYMENT_CURRENCY,
        itemCount: pricedItems.length,
      },
      processedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: order.id,
          total: order.total,
          status: order.status.toLowerCase(),
          razorpayOrderId: razorpayOrder.id,
        },
        payment: {
          key: process.env.RAZORPAY_KEY_ID,
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          receipt: razorpayOrder.receipt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order || order.userId !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({
        success: false,
        message: 'Order mismatch for payment verification',
      });
    }

    const isSignatureValid = verifyRazorpayPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isSignatureValid) {
      await createPaymentEvent({
        eventType: 'payment.verify.failed_signature',
        orderId: order.id,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        status: 'FAILED_SIGNATURE',
        payload: req.body,
      });

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    const processed = await markOrderAsPaid({
      orderId: id,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (processed.notFound) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (processed.mismatch) {
      return res.status(400).json({
        success: false,
        message: 'Order mismatch for payment verification',
      });
    }

    await createPaymentEvent({
      eventType: 'payment.verify.success',
      orderId: processed.order.id,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
      status: processed.alreadyProcessed ? 'DUPLICATE' : 'PROCESSED',
      payload: req.body,
      processedAt: new Date(),
    });

    const firstItemWithAccess = processed.order?.items?.find(
      (item) => item.accessStartTime || item.accessExpiryTime
    );

    res.json({
      success: true,
      message: processed.alreadyProcessed
        ? 'Payment already verified'
        : 'Payment verified successfully',
      data: {
        orderId: processed.order.id,
        status: processed.order.status.toLowerCase(),
        accessStartTime: processed.accessStart || firstItemWithAccess?.accessStartTime || null,
        accessExpiryTime: processed.accessExpiry || firstItemWithAccess?.accessExpiryTime || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body || {});

    if (!signature || typeof signature !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay signature header',
      });
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature',
      });
    }

    const event = JSON.parse(rawBody);
    const eventId = event?.payload?.payment?.entity?.id
      ? `${event.event}:${event.payload.payment.entity.id}`
      : event?.id || null;

    const paymentEntity = event?.payload?.payment?.entity || {};
    const razorpayOrderId = paymentEntity.order_id || null;
    const razorpayPaymentId = paymentEntity.id || null;

    const loggedEvent = await createPaymentEvent({
      eventId,
      eventType: event.event || 'unknown',
      paymentId: razorpayPaymentId,
      signature,
      status: 'RECEIVED',
      payload: event,
    });

    if (loggedEvent.duplicate && loggedEvent.record?.status === 'PROCESSED') {
      return res.json({ success: true, message: 'Duplicate webhook ignored' });
    }

    if (event.event === 'payment.captured' && razorpayOrderId && razorpayPaymentId) {
      const processed = await markOrderAsPaid({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
      });

      if (!processed.notFound && loggedEvent.record?.id) {
        await prisma.paymentEvent.update({
          where: { id: loggedEvent.record.id },
          data: {
            orderId: processed.order?.id || null,
            status: processed.alreadyProcessed ? 'DUPLICATE' : 'PROCESSED',
            processedAt: new Date(),
          },
        });
      }
    } else if (event.event === 'payment.failed' && razorpayOrderId) {
      const updated = await prisma.order.updateMany({
        where: {
          razorpayOrderId,
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
          razorpayPaymentId: razorpayPaymentId || undefined,
        },
      });

      if (loggedEvent.record?.id) {
        await prisma.paymentEvent.update({
          where: { id: loggedEvent.record.id },
          data: {
            orderId:
              (
                await prisma.order.findFirst({
                  where: { razorpayOrderId },
                  select: { id: true },
                })
              )?.id || null,
            status: updated.count > 0 ? 'PROCESSED' : 'DUPLICATE',
            processedAt: new Date(),
          },
        });
      }
    } else if (loggedEvent.record?.id) {
      await prisma.paymentEvent.update({
        where: { id: loggedEvent.record.id },
        data: {
          status: 'IGNORED',
          processedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = { userId: req.user.userId };
    if (status) where.status = String(status).toUpperCase();

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const transformedOrders = await Promise.all(
      orders.map(async (order) => ({
        id: order.id,
        items: await Promise.all(
          order.items.map(async (item) => ({
            productId: item.productId,
            title: item.product.title,
            previewImage: await getPreviewAccessUrl(item.product.previewImageHD),
            resolution: formatResolutionForDisplay(item.resolution),
            price: item.price,
            accessStartTime: item.accessStartTime,
            accessExpiryTime: item.accessExpiryTime,
          }))
        ),
        total: order.total,
        status: order.status.toLowerCase(),
        paymentId: order.paymentId,
        date: order.createdAt.toISOString(),
      }))
    );

    res.json({
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: parseInt(page, 10) > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.userId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order',
      });
    }

    const transformedOrder = {
      id: order.id,
      userId: order.userId,
      user: order.user,
      itemsDetail: await Promise.all(
        order.items.map(async (item) => ({
          product: {
            id: item.product.id,
            title: item.product.title,
            type: item.product.type.toLowerCase(),
            previewImage: await getPreviewAccessUrl(item.product.previewImageHD),
          },
          resolution: formatResolutionForDisplay(item.resolution),
          price: item.price,
          accessStartTime: item.accessStartTime,
          accessExpiryTime: item.accessExpiryTime,
        }))
      ),
      total: order.total,
      status: order.status.toLowerCase(),
      paymentId: order.paymentId,
      paymentMethod: order.paymentMethod,
      date: order.createdAt.toISOString(),
    };

    res.json({
      success: true,
      data: transformedOrder,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, userId, startDate, endDate } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};
    if (status) where.status = String(status).toUpperCase();
    if (userId) where.userId = String(userId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [orders, total, stats] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: true,
        },
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _sum: { total: true },
        _count: { _all: true },
      }),
    ]);

    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    });

    const statusStats = {
      totalOrders: stats._count._all,
      totalRevenue: stats._sum.total || 0,
      completedOrders: statusCounts.find((s) => s.status === 'COMPLETED')?._count._all || 0,
      pendingOrders: statusCounts.find((s) => s.status === 'PENDING')?._count._all || 0,
      failedOrders: statusCounts.find((s) => s.status === 'FAILED')?._count._all || 0,
    };

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page, 10),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: parseInt(page, 10) > 1,
        },
        stats: statusStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const generateDownloadLink = async (req, res, next) => {
  try {
    const { orderId, productId, resolution } = req.body;
    const normalizedResolution = normalizeResolution(resolution);
    const resolutionFields = resolutionFieldMap[normalizedResolution];

    if (!resolutionFields) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resolution. Use HD, Full HD, or 4K.',
      });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: {
            productId,
            resolution: normalizedResolution,
          },
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized for this order',
      });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(403).json({
        success: false,
        message: 'Payment not completed for this order',
      });
    }

    if (order.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchased item not found in order',
      });
    }

    const item = order.items[0];
    if (!item.accessStartTime || !item.accessExpiryTime) {
      return res.status(403).json({
        success: false,
        message: 'Access not provisioned yet. Please try again shortly.',
      });
    }

    const now = Date.now();
    const expiryMs = new Date(item.accessExpiryTime).getTime();
    const remainingSeconds = Math.floor((expiryMs - now) / 1000);

    if (remainingSeconds <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Access expired. Please re-purchase to continue.',
      });
    }

    const signedDuration = await getSignedAccessDuration();
    const urlExpiry = Math.max(1, Math.min(signedDuration, remainingSeconds));
    const isBundle = item.product.type === 'BUNDLE';

    const fileKeys = isBundle
      ? item.product[resolutionFields.bundle] || []
      : [item.product[resolutionFields.single]].filter(Boolean);

    if (fileKeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No downloadable files found for selected resolution',
      });
    }

    const downloadUrls = await Promise.all(
      fileKeys.map((fileKey) =>
        storageProvider.generateAccessUrl(fileKey, {
          bucketType: STORAGE_BUCKETS.ORIGINAL,
          access: ACCESS_TYPES.SIGNED,
          expiresIn: urlExpiry,
        })
      )
    );

    res.json({
      success: true,
      data: {
        downloadUrl: downloadUrls[0],
        downloadUrls,
        isBundle,
        resolution: formatResolutionForDisplay(normalizedResolution),
        accessStartTime: item.accessStartTime,
        accessExpiryTime: item.accessExpiryTime,
      },
    });
  } catch (error) {
    next(error);
  }
};
