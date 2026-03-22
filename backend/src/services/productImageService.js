import storageProvider, { STORAGE_BUCKETS } from '../storage/index.js';
import { processImageForMarketplace } from '../utils/imageProcessor.js';

function sanitizeForPath(input) {
  return String(input || 'product')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';
}

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function uploadVariant(buffer, objectPath, bucketType, metadata = {}) {
  await storageProvider.upload(buffer, objectPath, {
    bucketType,
    contentType: 'image/jpeg',
    metadata,
    acl: bucketType === STORAGE_BUCKETS.PREVIEW ? 'public-read' : undefined,
  });

  return objectPath;
}

async function uploadProcessedImage(processedImage, basePath, metadata) {
  const previewHD = await uploadVariant(
    processedImage.previews.HD,
    `${basePath}/preview/hd.jpg`,
    STORAGE_BUCKETS.PREVIEW,
    metadata
  );
  const previewFullHD = await uploadVariant(
    processedImage.previews.FULL_HD,
    `${basePath}/preview/full-hd.jpg`,
    STORAGE_BUCKETS.PREVIEW,
    metadata
  );
  const preview4K = await uploadVariant(
    processedImage.previews.FOUR_K,
    `${basePath}/preview/4k.jpg`,
    STORAGE_BUCKETS.PREVIEW,
    metadata
  );

  const originalHD = await uploadVariant(
    processedImage.originals.HD,
    `${basePath}/original/hd.jpg`,
    STORAGE_BUCKETS.ORIGINAL,
    metadata
  );
  const originalFullHD = await uploadVariant(
    processedImage.originals.FULL_HD,
    `${basePath}/original/full-hd.jpg`,
    STORAGE_BUCKETS.ORIGINAL,
    metadata
  );
  const original4K = await uploadVariant(
    processedImage.originals.FOUR_K,
    `${basePath}/original/4k.jpg`,
    STORAGE_BUCKETS.ORIGINAL,
    metadata
  );

  return {
    previews: {
      HD: previewHD,
      FULL_HD: previewFullHD,
      FOUR_K: preview4K,
    },
    originals: {
      HD: originalHD,
      FULL_HD: originalFullHD,
      FOUR_K: original4K,
    },
    metadata: processedImage.metadata,
  };
}

export async function processAndStoreProductImages(files, options = {}) {
  const {
    title = 'product',
    type = 'photo',
    processingConfig = {},
  } = options;

  const normalizedType = String(type || 'photo').trim().toLowerCase();
  const isBundle = normalizedType === 'bundle';

  if (!Array.isArray(files) || files.length === 0) {
    const error = new Error('At least one image file is required');
    error.statusCode = 400;
    throw error;
  }

  if (!isBundle && files.length > 1) {
    const error = new Error('Only one image is allowed for non-bundle products');
    error.statusCode = 400;
    throw error;
  }

  if (isBundle && files.length < 2) {
    const error = new Error('Bundle products require at least 2 images');
    error.statusCode = 400;
    throw error;
  }

  const productSlug = sanitizeForPath(title);
  const rootPath = `products/${normalizedType}/${productSlug}/${randomId()}`;

  const processed = await Promise.all(
    files.map(async (file, index) => {
      const imageResult = await processImageForMarketplace(file.buffer, processingConfig);
      const imagePath = `${rootPath}/image-${index + 1}`;
      const uploaded = await uploadProcessedImage(imageResult, imagePath, {
        originalName: file.originalname || `image-${index + 1}.jpg`,
        sourceType: normalizedType,
      });
      return uploaded;
    })
  );

  const first = processed[0];

  return {
    orientation: first.metadata.orientation,
    filesCount: processed.length,
    previewImageHD: first.previews.HD,
    previewImageFullHD: first.previews.FULL_HD,
    previewImage4K: first.previews.FOUR_K,
    originalFileHD: first.originals.HD,
    originalFileFullHD: first.originals.FULL_HD,
    originalFile4K: first.originals.FOUR_K,
    bundlePreviewsHD: isBundle ? processed.map((item) => item.previews.HD) : [],
    bundlePreviewsFullHD: isBundle ? processed.map((item) => item.previews.FULL_HD) : [],
    bundlePreviews4K: isBundle ? processed.map((item) => item.previews.FOUR_K) : [],
    bundleOriginalsHD: isBundle ? processed.map((item) => item.originals.HD) : [],
    bundleOriginalsFullHD: isBundle ? processed.map((item) => item.originals.FULL_HD) : [],
    bundleOriginals4K: isBundle ? processed.map((item) => item.originals.FOUR_K) : [],
  };
}

