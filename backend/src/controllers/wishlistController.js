import prisma from '../config/database.js';
import { getPreviewAccessUrl, getPreviewAccessUrls } from '../utils/storageUrl.js';

const DISCOUNT_VISIBILITY_THRESHOLD = 2;

function calculateDiscountPercent(actualPrice, displayPrice) {
  if (!displayPrice || displayPrice <= actualPrice) {
    return 0;
  }

  const percent = Math.round(((displayPrice - actualPrice) / displayPrice) * 100);
  return percent >= DISCOUNT_VISIBILITY_THRESHOLD ? percent : 0;
}

async function transformWishlistProduct(product) {
  const previewImage = await getPreviewAccessUrl(product.previewImageHD);
  const bundleImages = await getPreviewAccessUrls(product.bundlePreviewsHD || []);

  const discountPercent = {
    HD: calculateDiscountPercent(product.priceHD, product.displayPriceHD),
    'Full HD': calculateDiscountPercent(product.priceFullHD, product.displayPriceFullHD),
    '4K': calculateDiscountPercent(product.price4K, product.displayPrice4K),
  };

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    type: product.type.toLowerCase(),
    categories: product.categories,
    tags: product.tags,
    previewImage,
    bundleImages,
    orientation: product.orientation.toLowerCase(),
    uploadDate: product.uploadDate.toISOString().split('T')[0],
    popularity: product.popularity,
    prices: {
      HD: product.priceHD,
      'Full HD': product.priceFullHD,
      '4K': product.price4K,
    },
    displayPrices: {
      HD: product.displayPriceHD,
      'Full HD': product.displayPriceFullHD,
      '4K': product.displayPrice4K,
    },
    discountPercent,
    status: product.status.toLowerCase(),
    filesCount: product.filesCount,
    featured: product.featured,
  };
}

export const getWishlist = async (req, res, next) => {
  try {
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = await Promise.all(
      wishlistItems.map(async (item) => ({
        id: item.id,
        createdAt: item.createdAt,
        product: await transformWishlistProduct(item.product),
      }))
    );

    res.json({
      success: true,
      data: {
        items,
        itemCount: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Product not available',
      });
    }

    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: req.user.userId,
          productId,
        },
      },
      update: {},
      create: {
        userId: req.user.userId,
        productId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: req.user.userId,
        productId,
      },
    });

    res.json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};
