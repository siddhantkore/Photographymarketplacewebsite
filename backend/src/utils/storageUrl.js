import storageProvider, { ACCESS_TYPES, STORAGE_BUCKETS } from '../storage/index.js';

function isHttpUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export async function getPreviewAccessUrl(path) {
  if (!path) {
    return '';
  }

  if (isHttpUrl(path)) {
    return path;
  }

  return storageProvider.generateAccessUrl(path, {
    bucketType: STORAGE_BUCKETS.PREVIEW,
    access: ACCESS_TYPES.PUBLIC,
  });
}

export async function getPreviewAccessUrls(paths = []) {
  return Promise.all((paths || []).map((item) => getPreviewAccessUrl(item)));
}

