/**
 * S3 Helper Utility
 * Handles S3 operations including signed URL generation
 */

import AWS from 'aws-sdk';

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} key - S3 object key
 * @param {Object} options - Upload options
 * @returns {Promise<{success: boolean, key: string, url?: string}>}
 */
export async function uploadToS3(fileBuffer, key, options = {}) {
  const {
    contentType = 'image/jpeg',
    acl = 'private', // or 'public-read' for preview images
    metadata = {},
  } = options;

  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: acl,
      Metadata: metadata,
    };

    const result = await s3.upload(params).promise();

    return {
      success: true,
      key: result.Key,
      url: result.Location,
    };
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

/**
 * Generate signed URL for secure access to private files
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string>} - Signed URL
 */
export async function generateSignedUrl(key, expiresIn = 3600) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate signed URL');
  }
}

/**
 * Generate signed URLs for multiple files (e.g., bundle)
 * @param {string[]} keys - Array of S3 object keys
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string[]>} - Array of signed URLs
 */
export async function generateSignedUrls(keys, expiresIn = 3600) {
  try {
    const urls = await Promise.all(
      keys.map((key) => generateSignedUrl(key, expiresIn))
    );
    return urls;
  } catch (error) {
    console.error('Error generating signed URLs:', error);
    throw new Error('Failed to generate signed URLs');
  }
}

/**
 * Delete file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
export async function deleteFromS3(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting from S3:', error);
    return false;
  }
}

/**
 * Delete multiple files from S3
 * @param {string[]} keys - Array of S3 object keys
 * @returns {Promise<boolean>}
 */
export async function deleteMultipleFromS3(keys) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    };

    await s3.deleteObjects(params).promise();
    return true;
  } catch (error) {
    console.error('Error deleting multiple files from S3:', error);
    return false;
  }
}

/**
 * Check if file exists in S3
 * @param {string} key - S3 object key
 * @returns {Promise<boolean>}
 */
export async function fileExistsInS3(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Get file from S3
 * @param {string} key - S3 object key
 * @returns {Promise<Buffer>}
 */
export async function getFileFromS3(key) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error('Error getting file from S3:', error);
    throw new Error('Failed to get file from S3');
  }
}

/**
 * Generate unique S3 key with folder structure
 * @param {string} folder - Folder name (e.g., 'originals', 'previews')
 * @param {string} filename - Original filename
 * @param {string} quality - Quality level (HD, FULL_HD, FOUR_K)
 * @returns {string} - S3 key
 */
export function generateS3Key(folder, filename, quality = '') {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = filename.split('.').pop();
  const qualityPrefix = quality ? `${quality.toLowerCase()}_` : '';

  return `${folder}/${qualityPrefix}${timestamp}_${randomString}.${extension}`;
}

/**
 * Copy file within S3
 * @param {string} sourceKey - Source object key
 * @param {string} destinationKey - Destination object key
 * @returns {Promise<boolean>}
 */
export async function copyFileInS3(sourceKey, destinationKey) {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${sourceKey}`,
      Key: destinationKey,
    };

    await s3.copyObject(params).promise();
    return true;
  } catch (error) {
    console.error('Error copying file in S3:', error);
    return false;
  }
}

export default {
  uploadToS3,
  generateSignedUrl,
  generateSignedUrls,
  deleteFromS3,
  deleteMultipleFromS3,
  fileExistsInS3,
  getFileFromS3,
  generateS3Key,
  copyFileInS3,
};
