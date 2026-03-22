import prisma from '../config/database.js';
import { getPreviewAccessUrl } from '../utils/storageUrl.js';

const resolutionMapping = {
  HD: 'priceHD',
  'Full HD': 'priceFullHD',
  '4K': 'price4K',
  FULL_HD: 'priceFullHD',
  FOUR_K: 'price4K',
};

export const getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: true,
      },
    });

    const transformedItems = await Promise.all(
      cartItems.map(async (item) => ({
        productId: item.productId,
        title: item.product.title,
        previewImage: await getPreviewAccessUrl(item.product.previewImageHD),
        resolution: item.resolution.replace('_', ' '),
        price: item.price,
      }))
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
      return res.status(400).json({
        success: false,
        message: 'This product is not available',
      });
    }

    // Get price based on resolution
    const priceField = resolutionMapping[resolution];
    const price = product[priceField];

    // Convert resolution format
    const dbResolution = resolution.replace(' ', '_').toUpperCase();

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
      cartItems.map(async (item) => ({
        productId: item.productId,
        title: item.product.title,
        previewImage: await getPreviewAccessUrl(item.product.previewImageHD),
        resolution: item.resolution.replace('_', ' '),
        price: item.price,
      }))
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

    const dbResolution = resolution.replace(' ', '_').toUpperCase();

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
      cartItems.map(async (item) => ({
        productId: item.productId,
        title: item.product.title,
        previewImage: await getPreviewAccessUrl(item.product.previewImageHD),
        resolution: item.resolution.replace('_', ' '),
        price: item.price,
      }))
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
