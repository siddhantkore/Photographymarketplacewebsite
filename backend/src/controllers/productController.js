import prisma from '../config/database.js';

const resolutionMapping = {
  HD: 'priceHD',
  'Full HD': 'priceFullHD',
  '4K': 'price4K',
  FULL_HD: 'priceFullHD',
  FOUR_K: 'price4K',
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      category,
      orientation,
      status = 'ACTIVE',
      sort = 'uploadDate',
      order = 'desc',
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    // Only show active products for non-admin users
    if (!req.user || req.user.role !== 'ADMIN') {
      where.status = 'ACTIVE';
    } else if (status) {
      where.status = status;
    }

    if (type) where.type = type.toUpperCase();
    if (orientation) where.orientation = orientation.toUpperCase();
    if (category) where.categories = { has: category };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } },
      ];
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
      }),
      prisma.product.count({ where }),
    ]);

    // Transform response
    const transformedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      type: product.type.toLowerCase(),
      categories: product.categories,
      tags: product.tags,
      previewImage: product.previewImage,
      bundleImages: product.bundleImages,
      orientation: product.orientation.toLowerCase(),
      uploadDate: product.uploadDate.toISOString().split('T')[0],
      popularity: product.popularity,
      prices: {
        HD: product.priceHD,
        'Full HD': product.priceFullHD,
        '4K': product.price4K,
      },
      status: product.status.toLowerCase(),
      filesCount: product.filesCount,
    }));

    res.json({
      success: true,
      data: {
        products: transformedProducts,
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

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Only show inactive products to admin
    if (product.status === 'INACTIVE' && (!req.user || req.user.role !== 'ADMIN')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const transformedProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      type: product.type.toLowerCase(),
      categories: product.categories,
      tags: product.tags,
      previewImage: product.previewImage,
      bundleImages: product.bundleImages,
      orientation: product.orientation.toLowerCase(),
      uploadDate: product.uploadDate.toISOString().split('T')[0],
      popularity: product.popularity,
      prices: {
        HD: product.priceHD,
        'Full HD': product.priceFullHD,
        '4K': product.price4K,
      },
      status: product.status.toLowerCase(),
      filesCount: product.filesCount,
    };

    res.json({
      success: true,
      data: transformedProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type,
      categories,
      tags,
      previewImage,
      bundleImages,
      originalFiles,
      orientation,
      prices,
      status,
      filesCount,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        type: type.toUpperCase(),
        categories,
        tags,
        previewImage,
        bundleImages: bundleImages || [],
        originalFiles: originalFiles || [],
        orientation: orientation.toUpperCase(),
        priceHD: prices.HD,
        priceFullHD: prices['Full HD'],
        price4K: prices['4K'],
        status: status ? status.toUpperCase() : 'ACTIVE',
        filesCount: filesCount || 1,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: product.id,
        title: product.title,
        type: product.type.toLowerCase(),
        status: product.status.toLowerCase(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Transform enum fields
    if (updateData.type) updateData.type = updateData.type.toUpperCase();
    if (updateData.orientation) updateData.orientation = updateData.orientation.toUpperCase();
    if (updateData.status) updateData.status = updateData.status.toUpperCase();

    // Transform prices
    if (updateData.prices) {
      updateData.priceHD = updateData.prices.HD;
      updateData.priceFullHD = updateData.prices['Full HD'];
      updateData.price4K = updateData.prices['4K'];
      delete updateData.prices;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
