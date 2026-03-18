/**
 * Image Processing Utility
 * Handles watermarking, quality reduction, and image optimization
 * Uses Sharp for efficient image processing
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate watermarked preview image with reduced quality
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Watermark options
 * @param {string} options.text - Watermark text
 * @param {number} options.opacity - Watermark opacity (0-100)
 * @param {number} options.quality - JPEG quality (0-100)
 * @returns {Promise<Buffer>} - Watermarked image buffer
 */
export async function generateWatermarkedPreview(imageBuffer, options = {}) {
  const {
    text = 'PHOTOMARKET',
    opacity = 30,
    quality = 60,
  } = options;

  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Calculate watermark size based on image dimensions
    const fontSize = Math.min(width, height) * 0.08; // 8% of smallest dimension
    const diagonalLength = Math.sqrt(width ** 2 + height ** 2);

    // Create SVG watermark
    const watermarkSvg = `
      <svg width="${width}" height="${height}">
        <defs>
          <pattern id="watermark" x="0" y="0" width="${diagonalLength}" height="${diagonalLength}" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <text 
              x="${diagonalLength / 2}" 
              y="${diagonalLength / 2}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold" 
              fill="white" 
              fill-opacity="${opacity / 100}" 
              text-anchor="middle" 
              dominant-baseline="middle"
            >
              ${text}
            </text>
          </pattern>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#watermark)" />
      </svg>
    `;

    // Apply watermark and reduce quality
    const watermarkedBuffer = await sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: 'center',
        },
      ])
      .jpeg({ quality, progressive: true })
      .toBuffer();

    return watermarkedBuffer;
  } catch (error) {
    console.error('Error generating watermarked preview:', error);
    throw new Error('Failed to generate watermarked preview');
  }
}

/**
 * Process uploaded image and create both preview and original versions
 * @param {Buffer} imageBuffer - Original uploaded image
 * @param {Object} config - Processing configuration
 * @param {Object} config.watermark - Watermark settings
 * @param {number} config.previewQuality - Preview JPEG quality
 * @returns {Promise<{preview: Buffer, original: Buffer}>}
 */
export async function processUploadedImage(imageBuffer, config = {}) {
  const {
    watermark = { text: 'PHOTOMARKET', opacity: 30 },
    previewQuality = 60,
  } = config;

  try {
    // Generate watermarked preview
    const previewBuffer = await generateWatermarkedPreview(imageBuffer, {
      ...watermark,
      quality: previewQuality,
    });

    // Keep original as is (high quality, no watermark)
    // Optionally optimize without losing quality
    const originalBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 95, progressive: true })
      .toBuffer();

    return {
      preview: previewBuffer,
      original: originalBuffer,
    };
  } catch (error) {
    console.error('Error processing uploaded image:', error);
    throw new Error('Failed to process uploaded image');
  }
}

/**
 * Resize image to specific dimensions
 * @param {Buffer} imageBuffer - Image buffer
 * @param {Object} dimensions - Target dimensions
 * @param {number} dimensions.width - Target width
 * @param {number} dimensions.height - Target height
 * @param {Object} options - Resize options
 * @returns {Promise<Buffer>}
 */
export async function resizeImage(imageBuffer, dimensions, options = {}) {
  const { width, height } = dimensions;
  const { fit = 'cover', quality = 90 } = options;

  try {
    return await sharp(imageBuffer)
      .resize(width, height, { fit })
      .jpeg({ quality, progressive: true })
      .toBuffer();
  } catch (error) {
    console.error('Error resizing image:', error);
    throw new Error('Failed to resize image');
  }
}

/**
 * Get image metadata
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Image metadata
 */
export async function getImageMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      orientation: getOrientation(metadata.width, metadata.height),
    };
  } catch (error) {
    console.error('Error getting image metadata:', error);
    throw new Error('Failed to get image metadata');
  }
}

/**
 * Determine image orientation
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} - 'PORTRAIT', 'LANDSCAPE', or 'SQUARE'
 */
function getOrientation(width, height) {
  const ratio = width / height;
  if (Math.abs(ratio - 1) < 0.1) return 'SQUARE';
  return width > height ? 'LANDSCAPE' : 'PORTRAIT';
}

/**
 * Create thumbnail from image
 * @param {Buffer} imageBuffer - Image buffer
 * @param {number} size - Thumbnail size (max dimension)
 * @returns {Promise<Buffer>}
 */
export async function createThumbnail(imageBuffer, size = 300) {
  try {
    return await sharp(imageBuffer)
      .resize(size, size, { fit: 'inside' })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
  } catch (error) {
    console.error('Error creating thumbnail:', error);
    throw new Error('Failed to create thumbnail');
  }
}

/**
 * Validate image file
 * @param {Buffer} fileBuffer - File buffer
 * @param {Object} config - Validation config
 * @param {string[]} config.allowedFormats - Allowed image formats
 * @param {number} config.maxFileSize - Maximum file size in bytes
 * @returns {Promise<{valid: boolean, error?: string, metadata?: Object}>}
 */
export async function validateImage(fileBuffer, config = {}) {
  const {
    allowedFormats = ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSize = 52428800, // 50MB
  } = config;

  try {
    // Check file size
    if (fileBuffer.length > maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Get metadata
    const metadata = await sharp(fileBuffer).metadata();

    // Check format
    if (!allowedFormats.includes(metadata.format)) {
      return {
        valid: false,
        error: `Invalid image format. Allowed formats: ${allowedFormats.join(', ')}`,
      };
    }

    // Check if image is valid
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
        format: metadata.format,
        size: fileBuffer.length,
        orientation: getOrientation(metadata.width, metadata.height),
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid image file',
    };
  }
}

/**
 * Process bundle images (multiple images)
 * Creates watermarked previews and optimized originals for each
 * @param {Buffer[]} imageBuffers - Array of image buffers
 * @param {Object} config - Processing configuration
 * @returns {Promise<Array<{preview: Buffer, original: Buffer}>>}
 */
export async function processBundleImages(imageBuffers, config = {}) {
  try {
    const processed = await Promise.all(
      imageBuffers.map((buffer) => processUploadedImage(buffer, config))
    );
    return processed;
  } catch (error) {
    console.error('Error processing bundle images:', error);
    throw new Error('Failed to process bundle images');
  }
}

export default {
  generateWatermarkedPreview,
  processUploadedImage,
  resizeImage,
  getImageMetadata,
  createThumbnail,
  validateImage,
  processBundleImages,
};
