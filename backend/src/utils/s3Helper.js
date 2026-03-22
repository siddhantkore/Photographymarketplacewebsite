/**
 * Storage helper utility.
 * Kept as backward-compatible exports for existing code paths.
 */

import storageProvider, {
  ACCESS_TYPES,
  STORAGE_BUCKETS,
  normalizeStorageBucketType,
} from '../storage/index.js';

function resolveBucketType(options = {}) {
  if (options.bucketType) {
    return normalizeStorageBucketType(options.bucketType, STORAGE_BUCKETS.ORIGINAL);
  }

  if (options.acl === 'public-read') {
    return STORAGE_BUCKETS.PREVIEW;
  }

  return STORAGE_BUCKETS.ORIGINAL;
}

export async function uploadToStorage(fileBuffer, key, options = {}) {
  const bucketType = resolveBucketType(options);

  const result = await storageProvider.upload(fileBuffer, key, {
    bucketType,
    contentType: options.contentType,
    metadata: options.metadata,
    acl: options.acl,
  });

  return {
    success: true,
    key: result.path,
    url:
      result.url ||
      (await storageProvider.generateAccessUrl(key, {
        bucketType,
        access: bucketType === STORAGE_BUCKETS.PREVIEW ? ACCESS_TYPES.PUBLIC : ACCESS_TYPES.SIGNED,
        expiresIn: options.expiresIn || 3600,
      })),
  };
}

export async function uploadToS3(fileBuffer, key, options = {}) {
  return uploadToStorage(fileBuffer, key, options);
}

export async function generateSignedUrl(key, expiresIn = 3600) {
  return storageProvider.generateAccessUrl(key, {
    bucketType: STORAGE_BUCKETS.ORIGINAL,
    access: ACCESS_TYPES.SIGNED,
    expiresIn,
  });
}

export async function generateSignedUrls(keys, expiresIn = 3600) {
  return Promise.all(keys.map((key) => generateSignedUrl(key, expiresIn)));
}

export async function deleteFromStorage(key, options = {}) {
  const bucketType = resolveBucketType(options);
  await storageProvider.delete(key, { bucketType });
  return true;
}

export async function deleteFromS3(key, options = {}) {
  return deleteFromStorage(key, options);
}

export async function deleteMultipleFromS3(keys, options = {}) {
  await Promise.all(keys.map((key) => deleteFromStorage(key, options)));
  return true;
}

export async function fileExistsInS3(key, options = {}) {
  const bucketType = resolveBucketType(options);
  return storageProvider.exists(key, { bucketType });
}

export async function getFileFromS3(key, options = {}) {
  const bucketType = resolveBucketType(options);
  return storageProvider.get(key, { bucketType });
}

export function generateStorageKey(folder, filename, quality = '') {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = filename.split('.').pop();
  const qualityPrefix = quality ? `${quality.toLowerCase()}_` : '';

  return `${folder}/${qualityPrefix}${timestamp}_${randomString}.${extension}`;
}

export function generateS3Key(folder, filename, quality = '') {
  return generateStorageKey(folder, filename, quality);
}

export async function copyFileInS3(sourceKey, destinationKey, options = {}) {
  const bucketType = resolveBucketType(options);
  const fileBuffer = await storageProvider.get(sourceKey, { bucketType });
  await storageProvider.upload(fileBuffer, destinationKey, {
    bucketType,
    contentType: options.contentType,
    metadata: options.metadata,
    acl: options.acl,
  });
  return true;
}

export default {
  uploadToStorage,
  uploadToS3,
  generateSignedUrl,
  generateSignedUrls,
  deleteFromStorage,
  deleteFromS3,
  deleteMultipleFromS3,
  fileExistsInS3,
  getFileFromS3,
  generateStorageKey,
  generateS3Key,
  copyFileInS3,
};
