import prisma from '../config/database.js';
import { getPreviewAccessUrl } from '../utils/storageUrl.js';

const resolutionMapping = {
  HD: 'priceHD',
  'Full HD': 'priceFullHD',
  '4K': 'price4K',
  FULL_HD: 'priceFullHD',
  FOUR_K: 'price4K',
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

function transformCartItem(item, previewImage) {
  const isArchived = item.product.status !== 'ACTIVE';

  return {
    productId: item.productId,
    title: item.product.title,
    previewImage,
    resolution: formatResolutionForDisplay(item.resolution),
    price: item.price,
    status: item.product.status.toLowerCase(),
    isArchived,
    availableForPurchase: !isArchived,
    notice: isArchived
      ? 'This product has been archived. It remains in your cart, but it can no longer be purchased.'
      : null,
  };
}

export const getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: true,
      },
    });

    const transformedItems = await Promise.all(
      cartItems.map(async (item) =>
        transformCartItem(item, await getPreviewAccessUrl(item.product.previewImageHD))
      )
    );

    const total = transformedItems.reduce((sum, item) => sum + item.price, 0);

    res.json({
      success: true,
      data: {
        items: transformedItems,
        total,
        itemCount: transformedItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, resolution } = req.body;

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (product.status !== 'ACTIVE') {
      return res.status(409).json({
        success: false,
        message: 'This product has been archived and can no longer be added to the cart.',
      });
    }

    const priceField = resolutionMapping[resolution];
    if (!priceField) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resolution selected',
      });
    }

    const price = product[priceField];

    // Convert resolution format
    const dbResolution = normalizeResolution(resolution);

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId_resolution: {
          userId: req.user.userId,
          productId,
          resolution: dbResolution,
        },
      },
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in cart',
      });
    }

    // Add to cart
    await prisma.cartItem.create({
      data: {
        userId: req.user.userId,
        productId,
        resolution: dbResolution,
        price,
      },
    });

    // Get updated cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: { product: true },
    });

    const transformedItems = await Promise.all(
      cartItems.map(async (item) =>
        transformCartItem(item, await getPreviewAccessUrl(item.product.previewImageHD))
      )
    );

    const total = transformedItems.reduce((sum, item) => sum + item.price, 0);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: transformedItems,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId, resolution } = req.params;

    const dbResolution = normalizeResolution(resolution);

    await prisma.cartItem.delete({
      where: {
        userId_productId_resolution: {
          userId: req.user.userId,
          productId,
          resolution: dbResolution,
        },
      },
    });

    // Get updated cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: { product: true },
    });

    const transformedItems = await Promise.all(
      cartItems.map(async (item) =>
        transformCartItem(item, await getPreviewAccessUrl(item.product.previewImageHD))
      )
    );

    const total = transformedItems.reduce((sum, item) => sum + item.price, 0);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: transformedItems,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.userId },
    });

    res.json({
      success: true,
      message: 'Cart cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};
