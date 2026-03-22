import prisma from '../config/database.js';
import { processAndStoreProductImages } from '../services/productImageService.js';
import { getPreviewAccessUrl, getPreviewAccessUrls } from '../utils/storageUrl.js';

const DEFAULT_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;
const DEFAULT_PREVIEW_QUALITY = 60;

const resolutionMapping = {
  HD: 'priceHD',
  'Full HD': 'priceFullHD',
  '4K': 'price4K',
  FULL_HD: 'priceFullHD',
  FOUR_K: 'price4K',
};

function parseStringArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => String(entry).split(','))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
      }
    } catch {
      // fall through to CSV parser
    }

    return trimmed
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function parseFloatStrict(value, fallback = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toProductType(type) {
  return String(type || 'photo').replace(/\s+/g, '_').toUpperCase();
}

function toOrientation(orientation, fallback = 'LANDSCAPE') {
  if (!orientation) return fallback;
  const normalized = String(orientation).replace(/\s+/g, '_').toUpperCase();
  if (['PORTRAIT', 'LANDSCAPE', 'SQUARE'].includes(normalized)) {
    return normalized;
  }
  return fallback;
}

function parsePrices(payload = {}) {
  if (payload?.prices && typeof payload.prices === 'string') {
    try {
      payload.prices = JSON.parse(payload.prices);
    } catch {
      // Ignore and parse from direct fields below.
    }
  }

  const nested = payload.prices && typeof payload.prices === 'object' ? payload.prices : {};

  const hd = parseFloatStrict(payload.priceHD ?? nested.HD ?? nested.hd, NaN);
  const fullHd = parseFloatStrict(
    payload.priceFullHD ?? nested['Full HD'] ?? nested.FULL_HD ?? nested.fullHd,
    NaN
  );
  const fourK = parseFloatStrict(payload.price4K ?? nested['4K'] ?? nested.FOUR_K ?? nested.fourK, NaN);

  if (!Number.isFinite(hd) || !Number.isFinite(fullHd) || !Number.isFinite(fourK)) {
    const error = new Error('Valid pricing is required for HD, Full HD, and 4K');
    error.statusCode = 400;
    throw error;
  }

  return {
    HD: hd,
    FULL_HD: fullHd,
    FOUR_K: fourK,
  };
}

async function getImageProcessingConfig(overrides = {}) {
  const config = await prisma.siteConfig.findFirst();
  const watermarkOpacity = Number.parseInt(
    overrides.watermarkOpacity ?? config?.watermarkOpacity ?? 30,
    10
  );
  const hasImageWatermark = Boolean(overrides.watermarkImageBuffer);

  return {
    allowedFormats: config?.allowedImageFormats?.length
      ? config.allowedImageFormats
      : DEFAULT_ALLOWED_FORMATS,
    maxFileSize: config?.maxFileSize || DEFAULT_MAX_FILE_SIZE,
    previewQuality: config?.previewQuality || DEFAULT_PREVIEW_QUALITY,
    originalQuality: 92,
    watermark: {
      type: overrides.watermarkType || (hasImageWatermark ? 'image' : 'text'),
      text: overrides.watermarkText || config?.watermarkText || 'PHOTOMARKET',
      opacity: Number.isFinite(watermarkOpacity) ? watermarkOpacity : 30,
      position: overrides.watermarkPosition || 'center',
      imageBuffer: overrides.watermarkImageBuffer || null,
    },
  };
}

async function transformProduct(product) {
  const previewImageHDUrl = await getPreviewAccessUrl(product.previewImageHD);
  const previewImageFullHDUrl = await getPreviewAccessUrl(product.previewImageFullHD);
  const previewImage4KUrl = await getPreviewAccessUrl(product.previewImage4K);
  const bundlePreviewsHD = await getPreviewAccessUrls(product.bundlePreviewsHD || []);
  const bundlePreviewsFullHD = await getPreviewAccessUrls(product.bundlePreviewsFullHD || []);
  const bundlePreviews4K = await getPreviewAccessUrls(product.bundlePreviews4K || []);

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    type: product.type.toLowerCase(),
    categories: product.categories,
    tags: product.tags,
    previewImage: previewImageHDUrl,
    previewImages: {
      HD: previewImageHDUrl,
      FullHD: previewImageFullHDUrl,
      '4K': previewImage4KUrl,
    },
    bundleImages: bundlePreviewsHD,
    bundlePreviews: {
      HD: bundlePreviewsHD,
      FullHD: bundlePreviewsFullHD,
      '4K': bundlePreviews4K,
    },
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
}

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

    const skip = (Number.parseInt(page, 10) - 1) * Number.parseInt(limit, 10);
    const take = Number.parseInt(limit, 10);

    const where = {};

    if (!req.user || req.user.role !== 'ADMIN') {
      where.status = 'ACTIVE';
    } else if (status) {
      where.status = String(status).toUpperCase();
    }

    if (type) where.type = String(type).toUpperCase();
    if (orientation) where.orientation = String(orientation).toUpperCase();
    if (category) where.categories = { has: String(category) };

    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { tags: { hasSome: [String(search).toLowerCase()] } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sort]: order },
      }),
      prisma.product.count({ where }),
    ]);

    const transformedProducts = await Promise.all(products.map((product) => transformProduct(product)));

    res.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage: Number.parseInt(page, 10),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: Number.parseInt(page, 10) > 1,
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

    if (product.status === 'INACTIVE' && (!req.user || req.user.role !== 'ADMIN')) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const transformedProduct = await transformProduct(product);

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
    const { title, description } = req.body;
    const type = toProductType(req.body.type);
    const categories = parseStringArray(req.body.categories);
    const tags = parseStringArray(req.body.tags);
    const prices = parsePrices(req.body);
    const status = req.body.status ? String(req.body.status).toUpperCase() : 'ACTIVE';
    const fileGroups = !Array.isArray(req.files) && req.files ? req.files : {};
    const uploadedFiles = Array.isArray(fileGroups.files)
      ? fileGroups.files
      : Array.isArray(req.files)
        ? req.files
        : [];
    const watermarkImageBuffer = Array.isArray(fileGroups.watermarkImage)
      ? fileGroups.watermarkImage[0]?.buffer
      : null;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const processingConfig = await getImageProcessingConfig({
      ...req.body,
      watermarkImageBuffer,
    });
    const processedImages = await processAndStoreProductImages(uploadedFiles, {
      title,
      type,
      processingConfig,
    });

    const product = await prisma.product.create({
      data: {
        title,
        description,
        type,
        categories,
        tags,
        previewImageHD: processedImages.previewImageHD,
        previewImageFullHD: processedImages.previewImageFullHD,
        previewImage4K: processedImages.previewImage4K,
        bundlePreviewsHD: processedImages.bundlePreviewsHD,
        bundlePreviewsFullHD: processedImages.bundlePreviewsFullHD,
        bundlePreviews4K: processedImages.bundlePreviews4K,
        originalFileHD: processedImages.originalFileHD,
        originalFileFullHD: processedImages.originalFileFullHD,
        originalFile4K: processedImages.originalFile4K,
        bundleOriginalsHD: processedImages.bundleOriginalsHD,
        bundleOriginalsFullHD: processedImages.bundleOriginalsFullHD,
        bundleOriginals4K: processedImages.bundleOriginals4K,
        orientation: toOrientation(req.body.orientation, processedImages.orientation),
        priceHD: prices.HD,
        priceFullHD: prices.FULL_HD,
        price4K: prices.FOUR_K,
        status,
        filesCount: processedImages.filesCount,
      },
    });

    const transformed = await transformProduct(product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: transformed,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.type) updateData.type = toProductType(updateData.type);
    if (updateData.orientation) updateData.orientation = toOrientation(updateData.orientation);
    if (updateData.status) updateData.status = String(updateData.status).toUpperCase();

    if (updateData.prices) {
      const prices = parsePrices({ prices: updateData.prices });
      updateData.priceHD = prices.HD;
      updateData.priceFullHD = prices.FULL_HD;
      updateData.price4K = prices.FOUR_K;
      delete updateData.prices;
    }

    if (updateData.categories) {
      updateData.categories = parseStringArray(updateData.categories);
    }

    if (updateData.tags) {
      updateData.tags = parseStringArray(updateData.tags);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    const transformed = await transformProduct(product);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: transformed,
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

export { resolutionMapping };
