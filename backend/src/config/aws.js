import upload from '../storage/uploadMiddleware.js';
import storageProvider, { ACCESS_TYPES, STORAGE_BUCKETS } from '../storage/index.js';

// Legacy compatibility wrapper. Prefer importing from ../storage/index.js in new code.
export { upload };

export const deleteFromS3 = async (key) => {
  return storageProvider.delete(key, { bucketType: STORAGE_BUCKETS.PREVIEW });
};

export const generateSignedUrl = async (key, expiresIn = 3600) => {
  return storageProvider.generateAccessUrl(key, {
    bucketType: STORAGE_BUCKETS.ORIGINAL,
    access: ACCESS_TYPES.SIGNED,
    expiresIn,
  });
};

export const getPublicUrl = async (key) => {
  return storageProvider.generateAccessUrl(key, {
    bucketType: STORAGE_BUCKETS.PREVIEW,
    access: ACCESS_TYPES.PUBLIC,
  });
};

export const s3 = null;

export default storageProvider;
