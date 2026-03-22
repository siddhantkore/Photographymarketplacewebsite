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

function getGravityFromPosition(position = 'center') {
  const normalized = String(position).trim().toLowerCase();
  const map = {
    center: 'center',
    top: 'north',
    bottom: 'south',
    left: 'west',
    right: 'east',
    top_left: 'northwest',
    top_right: 'northeast',
    bottom_left: 'southwest',
    bottom_right: 'southeast',
  };

  return map[normalized] || 'center';
}

function buildCrossTextWatermarkSvg(width, height, options) {
  const {
    text = 'PHOTOMARKET',
    opacity = 30,
    position = 'center',
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

  const baseSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <g fill="rgba(255,255,255,${alpha})">
        <g transform="translate(${centerX},${centerY}) rotate(-35) translate(${-centerX},${-centerY})">
          ${repeatedLines}
        </g>
        <g transform="translate(${centerX},${centerY}) rotate(35) translate(${-centerX},${-centerY})">
          ${repeatedLines}
        </g>
      </g>
    </svg>
  `;

  return {
    svg: baseSvg,
    gravity: getGravityFromPosition(position),
  };
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
 * Applies watermark once on a high-resolution buffer.
 */
export async function applyWatermark(imageBuffer, options = {}) {
  const {
    type = 'text',
    text = 'PHOTOMARKET',
    opacity = 30,
    position = 'center',
    imageBuffer: watermarkImageBuffer,
  } = options;

  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1920;
  const height = metadata.height || 1080;

  const composites = [];
  if (type === 'image' && watermarkImageBuffer) {
    const preparedWatermark = await buildImageWatermarkBuffer(
      watermarkImageBuffer,
      width,
      height,
      opacity
    );
    composites.push({
      input: preparedWatermark,
      gravity: getGravityFromPosition(position),
      blend: 'over',
    });
  } else {
    const { svg, gravity } = buildCrossTextWatermarkSvg(width, height, {
      text,
      opacity,
      position,
    });
    composites.push({
      input: Buffer.from(svg),
      gravity,
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
 * - Watermark once
 * - Generate preview variants from watermarked base
 */
export async function processImageForMarketplace(imageBuffer, config = {}) {
  const {
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize = 50 * 1024 * 1024,
    previewQuality = 60,
    originalQuality = 92,
    watermark = {
      type: 'text',
      text: 'PHOTOMARKET',
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

  const original4K = await resizeToPreset(imageBuffer, RESOLUTION_PRESETS.FOUR_K, originalQuality);
  const originalFullHD = await resizeToPreset(imageBuffer, RESOLUTION_PRESETS.FULL_HD, originalQuality);
  const originalHD = await resizeToPreset(imageBuffer, RESOLUTION_PRESETS.HD, originalQuality);

  // Watermark is applied once on a single high-res image, then resized.
  const watermarkedBase = await applyWatermark(original4K, watermark);

  const preview4K = await resizeToPreset(watermarkedBase, RESOLUTION_PRESETS.FOUR_K, previewQuality);
  const previewFullHD = await resizeToPreset(watermarkedBase, RESOLUTION_PRESETS.FULL_HD, previewQuality);
  const previewHD = await resizeToPreset(watermarkedBase, RESOLUTION_PRESETS.HD, previewQuality);

  return {
    metadata: validation.metadata,
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

