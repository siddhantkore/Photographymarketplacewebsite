import prisma from '../config/database.js';
import { processAndStoreProductImages } from '../services/productImageService.js';
import { getPreviewAccessUrl, getPreviewAccessUrls } from '../utils/storageUrl.js';

const DEFAULT_ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const DEFAULT_MAX_FILE_SIZE = 50 * 1024 * 1024;
const DEFAULT_PREVIEW_QUALITY = 60;
const DISCOUNT_VISIBILITY_THRESHOLD = 2;

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

function parseOptionalPrice(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDisplayPrices(payload = {}, actualPrices) {
  if (payload?.displayPrices && typeof payload.displayPrices === 'string') {
    try {
      payload.displayPrices = JSON.parse(payload.displayPrices);
    } catch {
      // Ignore and fall through.
    }
  }

  const nested =
    payload.displayPrices && typeof payload.displayPrices === 'object' ? payload.displayPrices : {};

  const displayHD = parseOptionalPrice(payload.displayPriceHD ?? nested.HD ?? nested.hd);
  const displayFullHD = parseOptionalPrice(
    payload.displayPriceFullHD ?? nested['Full HD'] ?? nested.FULL_HD ?? nested.fullHd
  );
  const display4K = parseOptionalPrice(payload.displayPrice4K ?? nested['4K'] ?? nested.FOUR_K ?? nested.fourK);

  return {
    HD: displayHD && displayHD > actualPrices.HD ? displayHD : null,
    FULL_HD: displayFullHD && displayFullHD > actualPrices.FULL_HD ? displayFullHD : null,
    FOUR_K: display4K && display4K > actualPrices.FOUR_K ? display4K : null,
  };
}

function calculateDiscountPercent(actualPrice, displayPrice) {
  if (!displayPrice || displayPrice <= actualPrice) {
    return 0;
  }

  const percent = Math.round(((displayPrice - actualPrice) / displayPrice) * 100);
  return percent >= DISCOUNT_VISIBILITY_THRESHOLD ? percent : 0;
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
      text: overrides.watermarkText || config?.watermarkText || 'LIKE PHOTO STUDIO',
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
    displayPrices: {
      HD: product.displayPriceHD,
      'Full HD': product.displayPriceFullHD,
      '4K': product.displayPrice4K,
    },
    discountPercent: {
      HD: calculateDiscountPercent(product.priceHD, product.displayPriceHD),
      'Full HD': calculateDiscountPercent(product.priceFullHD, product.displayPriceFullHD),
      '4K': calculateDiscountPercent(product.price4K, product.displayPrice4K),
    },
    featured: product.featured,
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
      status,
      sort = 'uploadDate',
      order = 'desc',
      search,
      featured,
      priceMin,
      priceMax,
    } = req.query;

    const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * take;
    const allowedSortFields = new Set([
      'uploadDate',
      'createdAt',
      'updatedAt',
      'popularity',
      'priceHD',
      'priceFullHD',
      'price4K',
      'title',
    ]);
    const safeSort = allowedSortFields.has(String(sort)) ? String(sort) : 'uploadDate';
    const safeOrder = String(order).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const where = {};
    const validStatuses = new Set(['ACTIVE', 'INACTIVE']);

    if (!req.user || req.user.role !== 'ADMIN') {
      where.status = 'ACTIVE';
    } else if (status !== undefined && status !== null) {
      const normalizedStatus = String(status).trim().toUpperCase();
      if (normalizedStatus && normalizedStatus !== 'ALL' && validStatuses.has(normalizedStatus)) {
        where.status = normalizedStatus;
      }
    }

    if (type) {
      const types = parseStringArray(type);
      if (types.length === 1) {
        where.type = types[0].toUpperCase();
      } else if (types.length > 1) {
        where.type = { in: types.map((t) => t.toUpperCase()) };
      }
    }
    if (orientation) {
      const orientations = parseStringArray(orientation);
      if (orientations.length === 1) {
        where.orientation = orientations[0].toUpperCase();
      } else if (orientations.length > 1) {
        where.orientation = { in: orientations.map((o) => o.toUpperCase()) };
      }
    }
    if (category) {
      const categories = parseStringArray(category);
      if (categories.length === 1) {
        where.categories = { has: categories[0] };
      } else if (categories.length > 1) {
        where.categories = { hasSome: categories };
      }
    }
    if (priceMin !== undefined || priceMax !== undefined) {
      const minP = Number.parseFloat(priceMin);
      const maxP = Number.parseFloat(priceMax);
      const priceConditions = [];
      if (Number.isFinite(minP)) priceConditions.push({ gte: minP });
      if (Number.isFinite(maxP)) priceConditions.push({ lte: maxP });
      if (priceConditions.length > 0) {
        where.OR = [
          ...(where.OR || []),
          { priceHD: { AND: priceConditions } },
          { priceFullHD: { AND: priceConditions } },
          { price4K: { AND: priceConditions } },
        ];
      }
    }
    if (featured !== undefined && featured !== null) {
      const normalizedFeatured = String(featured).trim().toLowerCase();
      if (normalizedFeatured === 'true' || normalizedFeatured === 'false') {
        where.featured = normalizedFeatured === 'true';
      }
    }

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
        orderBy: { [safeSort]: safeOrder },
      }),
      prisma.product.count({ where }),
    ]);

    const transformedProducts = await Promise.all(products.map((product) => transformProduct(product)));

    res.json({
      success: true,
      data: {
        products: transformedProducts,
        pagination: {
          currentPage,
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
          hasNextPage: skip + take < total,
          hasPrevPage: currentPage > 1,
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
    const displayPrices = parseDisplayPrices(req.body, prices);
    const status = req.body.status ? String(req.body.status).toUpperCase() : 'ACTIVE';
    const featured = String(req.body.featured || 'false').toLowerCase() === 'true';
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
        displayPriceHD: displayPrices.HD,
        displayPriceFullHD: displayPrices.FULL_HD,
        displayPrice4K: displayPrices.FOUR_K,
        featured,
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

    if (
      updateData.displayPrices ||
      updateData.displayPriceHD !== undefined ||
      updateData.displayPriceFullHD !== undefined ||
      updateData.displayPrice4K !== undefined
    ) {
      const actualPrices = {
        HD:
          parseOptionalPrice(updateData.priceHD) ??
          parseOptionalPrice(req.body.priceHD) ??
          parseOptionalPrice(updateData?.prices?.HD),
        FULL_HD:
          parseOptionalPrice(updateData.priceFullHD) ??
          parseOptionalPrice(req.body.priceFullHD) ??
          parseOptionalPrice(updateData?.prices?.['Full HD']),
        FOUR_K:
          parseOptionalPrice(updateData.price4K) ??
          parseOptionalPrice(req.body.price4K) ??
          parseOptionalPrice(updateData?.prices?.['4K']),
      };

      if (
        actualPrices.HD === null ||
        actualPrices.FULL_HD === null ||
        actualPrices.FOUR_K === null
      ) {
        const existing = await prisma.product.findUnique({
          where: { id },
          select: { priceHD: true, priceFullHD: true, price4K: true },
        });

        actualPrices.HD = actualPrices.HD ?? existing?.priceHD ?? 0;
        actualPrices.FULL_HD = actualPrices.FULL_HD ?? existing?.priceFullHD ?? 0;
        actualPrices.FOUR_K = actualPrices.FOUR_K ?? existing?.price4K ?? 0;
      }

      const displayPrices = parseDisplayPrices(updateData, {
        HD: actualPrices.HD,
        FULL_HD: actualPrices.FULL_HD,
        FOUR_K: actualPrices.FOUR_K,
      });

      updateData.displayPriceHD = displayPrices.HD;
      updateData.displayPriceFullHD = displayPrices.FULL_HD;
      updateData.displayPrice4K = displayPrices.FOUR_K;
      delete updateData.displayPrices;
    }

    if (updateData.featured !== undefined) {
      updateData.featured = String(updateData.featured).toLowerCase() === 'true' || updateData.featured === true;
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
