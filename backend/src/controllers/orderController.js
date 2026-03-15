import prisma from '../config/database.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import { generateSignedUrl } from '../config/storage.js';

export const createOrder = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;

    // Get cart items
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

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    });

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: req.user.userId,
        total,
        status: 'PENDING',
        paymentMethod,
        razorpayOrderId: razorpayOrder.id,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            resolution: item.resolution,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
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
        paymentUrl: `https://api.razorpay.com/v1/checkout/${razorpayOrder.id}`,
        razorpayKey: process.env.RAZORPAY_KEY_ID,
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

    // Verify signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        paymentId: razorpayPaymentId,
        razorpayPaymentId,
        razorpaySignature,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.userId },
    });

    // Increment product popularity
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { popularity: { increment: 1 } },
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { userId: req.user.userId };
    if (status) where.status = status.toUpperCase();

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

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      items: order.items.map((item) => ({
        productId: item.productId,
        title: item.product.title,
        resolution: item.resolution.replace('_', ' '),
        price: item.price,
      })),
      total: order.total,
      status: order.status.toLowerCase(),
      paymentId: order.paymentId,
      date: order.createdAt.toISOString(),
    }));

    res.json({
      success: true,
      data: {
        orders: transformedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: page > 1,
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

    // Check if user owns this order or is admin
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
      itemsDetail: order.items.map((item) => ({
        product: {
          id: item.product.id,
          title: item.product.title,
          type: item.product.type.toLowerCase(),
          previewImage: item.product.previewImage,
        },
        resolution: item.resolution.replace('_', ' '),
        price: item.price,
        downloadUrl:
          order.status === 'COMPLETED'
            ? `/api/v1/downloads/product/${order.id}/${item.productId}/${item.resolution.replace('_', ' ')}`
            : null,
      })),
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

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status.toUpperCase();
    if (userId) where.userId = userId;
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
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: page > 1,
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

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: {
            productId,
            resolution: resolution.replace(' ', '_').toUpperCase(),
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
        message: 'You have not purchased this product',
      });
    }

    if (order.status !== 'COMPLETED') {
      return res.status(403).json({
        success: false,
        message: 'Order is not completed',
      });
    }

    if (order.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in order',
      });
    }

    const item = order.items[0];
    const product = item.product;

    // Get file key from S3
    const fileKey = product.originalFiles[0]; // For bundles, this would be a zip file

    // Generate signed URL (valid for 1 hour)
    const downloadUrl = generateSignedUrl(fileKey, 3600);
    const expiresAt = new Date(Date.now() + 3600 * 1000);

    res.json({
      success: true,
      data: {
        downloadUrl,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
