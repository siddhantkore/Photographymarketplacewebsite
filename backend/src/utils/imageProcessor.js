/**
 * Image Processing Utility
 * Handles validation, resizing, quality optimization, and watermarking.
 */

import sharp from 'sharp';

const RESOLUTION_PRESETS = Object.freeze({
  HD: { width: 1280, height: 720 },
  FULL_HD: { width: 1920, height: 1080 },
  FOUR_K: { width: 3840, height: 2160 },
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getOrientation(width, height) {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.1) return 'SQUARE';
  return width > height ? 'LANDSCAPE' : 'PORTRAIT';
}

async function resizeToPreset(imageBuffer, preset, quality) {
  return sharp(imageBuffer)
    .resize(preset.width, preset.height, {
      fit: 'inside',
      withoutEnlargement: true,
      kernel: sharp.kernel.lanczos3,
    })
    .jpeg({
      quality: clamp(quality, 30, 100),
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer();
}

function buildDiagonalTextWatermarkSvg(width, height, options) {
  const {
    text = 'LIKE PHOTO STUDIO',
    opacity = 30,
  } = options;

  const safeText = escapeXml(text);
  const imageMin = Math.min(width, height);
  const fontSize = Math.max(24, Math.round(imageMin * 0.05));
  const lineGap = Math.max(36, Math.round(fontSize * 1.9));
  const centerX = Math.round(width / 2);
  const centerY = Math.round(height / 2);
  const alpha = clamp(opacity, 0, 100) / 100;

  const yLines = [];
  for (let y = -height; y <= height * 2; y += lineGap) {
    yLines.push(y);
  }

  const repeatedLines = yLines
    .map(
      (y) =>
        `<text x="${centerX}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" text-anchor="middle">${safeText}</text>`
    )
    .join('');

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <g fill="rgba(255,255,255,${alpha})">
        <g transform="translate(${centerX},${centerY}) rotate(35) translate(${-centerX},${-centerY})">
          ${repeatedLines}
        </g>
      </g>
    </svg>
  `;

  return Buffer.from(svg);
}

async function buildImageWatermarkBuffer(imageBuffer, baseWidth, baseHeight, opacity) {
  const targetWidth = Math.max(120, Math.round(baseWidth * 0.22));
  const targetHeight = Math.max(120, Math.round(baseHeight * 0.22));

  return sharp(imageBuffer)
    .resize(targetWidth, targetHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .ensureAlpha(clamp(opacity, 0, 100) / 100)
    .png()
    .toBuffer();
}

async function buildDiagonalImageWatermarkComposites(preparedWatermarkBuffer, baseWidth, baseHeight) {
  const watermarkMeta = await sharp(preparedWatermarkBuffer).metadata();
  const watermarkWidth = Math.max(80, watermarkMeta.width || 0);
  const watermarkHeight = Math.max(80, watermarkMeta.height || 0);
  const stepX = Math.max(Math.round(watermarkWidth * 1.9), 160);
  const stepY = Math.max(Math.round(watermarkHeight * 1.7), 140);
  const slope = 0.65;
  const overlays = [];

  for (let lineStartY = baseHeight + watermarkHeight; lineStartY >= -watermarkHeight; lineStartY -= stepY) {
    for (let x = -watermarkWidth; x <= baseWidth + watermarkWidth; x += stepX) {
      const y = Math.round(lineStartY - x * slope);
      if (y < -watermarkHeight || y > baseHeight + watermarkHeight) {
        continue;
      }

      overlays.push({
        input: preparedWatermarkBuffer,
        left: Math.round(x),
        top: y,
        blend: 'over',
      });
    }
  }

  return overlays;
}

async function reencodeJpeg(imageBuffer, quality) {
  return sharp(imageBuffer)
    .jpeg({
      quality: clamp(quality, 30, 100),
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer();
}

/**
 * Validate image file buffer.
 */
export async function validateImage(fileBuffer, config = {}) {
  const {
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize = 50 * 1024 * 1024,
  } = config;

  try {
    if (fileBuffer.length > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${Math.round(maxFileSize / 1024 / 1024)}MB`,
      };
    }

    const metadata = await sharp(fileBuffer).metadata();
    const format = String(metadata.format || '').toLowerCase();

    if (!allowedFormats.map((f) => f.toLowerCase()).includes(format)) {
      return {
        valid: false,
        error: `Invalid image format. Allowed formats: ${allowedFormats.join(', ')}`,
      };
    }

    if (!metadata.width || !metadata.height) {
      return {
        valid: false,
        error: 'Invalid image dimensions',
      };
    }

    return {
      valid: true,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format,
        size: fileBuffer.length,
        orientation: getOrientation(metadata.width, metadata.height),
      },
    };
  } catch {
    return {
      valid: false,
      error: 'Invalid image file',
    };
  }
}

/**
 * Applies repeated diagonal watermark overlays on an image buffer.
 */
export async function applyWatermark(imageBuffer, options = {}) {
  const {
    type = 'text',
    text = 'LIKE PHOTO STUDIO',
    opacity = 30,
    imageBuffer: watermarkImageBuffer,
  } = options;

  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1920;
  const height = metadata.height || 1080;

  let composites = [];
  if (type === 'image' && watermarkImageBuffer) {
    const preparedWatermark = await buildImageWatermarkBuffer(
      watermarkImageBuffer,
      width,
      height,
      opacity
    );
    composites = await buildDiagonalImageWatermarkComposites(preparedWatermark, width, height);
  } else {
    const textOverlay = buildDiagonalTextWatermarkSvg(width, height, {
      text,
      opacity,
    });
    composites.push({
      input: textOverlay,
      blend: 'over',
    });
  }

  return sharp(imageBuffer)
    .composite(composites)
    .jpeg({
      quality: 95,
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer();
}

/**
 * Legacy helper retained for compatibility.
 */
export async function generateWatermarkedPreview(imageBuffer, options = {}) {
  const {
    quality = 60,
    ...watermarkOptions
  } = options;

  const watermarked = await applyWatermark(imageBuffer, watermarkOptions);
  return sharp(watermarked)
    .jpeg({
      quality: clamp(quality, 30, 100),
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer();
}

/**
 * Full marketplace processing pipeline for a single image.
 * - Validate
 * - Generate original variants (HD/FULL_HD/FOUR_K)
 * - Apply watermark only to preview variants
 * - Keep downloadable originals watermark-free
 */
export async function processImageForMarketplace(imageBuffer, config = {}) {
  const {
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize = 50 * 1024 * 1024,
    previewQuality = 60,
    originalQuality = 92,
    watermark = {
      type: 'text',
      text: 'LIKE PHOTO STUDIO',
      opacity: 30,
      position: 'center',
    },
  } = config;

  const validation = await validateImage(imageBuffer, {
    allowedFormats,
    maxFileSize,
  });

  if (!validation.valid) {
    const error = new Error(validation.error || 'Invalid image file');
    error.statusCode = 400;
    throw error;
  }

  const resized4K = await resizeToPreset(imageBuffer, RESOLUTION_PRESETS.FOUR_K, originalQuality);
  const resizedFullHD = await resizeToPreset(imageBuffer, RESOLUTION_PRESETS.FULL_HD, originalQuality);
  const resizedHD = await resizeToPreset(imageBuffer, RESOLUTION_PRESETS.HD, originalQuality);

  const [watermarkedPreview4K, watermarkedPreviewFullHD, watermarkedPreviewHD] = await Promise.all([
    applyWatermark(resized4K, watermark),
    applyWatermark(resizedFullHD, watermark),
    applyWatermark(resizedHD, watermark),
  ]);

  const [preview4K, previewFullHD, previewHD] = await Promise.all([
    reencodeJpeg(watermarkedPreview4K, previewQuality),
    reencodeJpeg(watermarkedPreviewFullHD, previewQuality),
    reencodeJpeg(watermarkedPreviewHD, previewQuality),
  ]);

  return {
    metadata: validation.metadata,
    previews: {
      HD: previewHD,
      FULL_HD: previewFullHD,
      FOUR_K: preview4K,
    },
    originals: {
      HD: resizedHD,
      FULL_HD: resizedFullHD,
      FOUR_K: resized4K,
    },
  };
}

/**
 * Legacy helper retained for compatibility.
 */
export async function processUploadedImage(imageBuffer, config = {}) {
  const processed = await processImageForMarketplace(imageBuffer, config);
  return {
    preview: processed.previews.HD,
    original: processed.originals.FOUR_K,
  };
}

export async function processBundleImages(imageBuffers, config = {}) {
  return Promise.all(imageBuffers.map((buffer) => processImageForMarketplace(buffer, config)));
}

export async function resizeImage(imageBuffer, dimensions, options = {}) {
  const { width, height } = dimensions;
  const quality = options.quality || 90;

  return sharp(imageBuffer)
    .resize(width, height, {
      fit: options.fit || 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: clamp(quality, 30, 100),
      progressive: true,
      mozjpeg: true,
    })
    .toBuffer();
}

export async function getImageMetadata(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size,
    orientation: getOrientation(metadata.width || 0, metadata.height || 0),
  };
}

export async function createThumbnail(imageBuffer, size = 300) {
  return sharp(imageBuffer)
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toBuffer();
}

export default {
  generateWatermarkedPreview,
  processUploadedImage,
  processImageForMarketplace,
  resizeImage,
  getImageMetadata,
  createThumbnail,
  validateImage,
  processBundleImages,
  applyWatermark,
};
