export const STORAGE_PROVIDERS = Object.freeze({
  MINIO: 'minio',
  S3: 's3',
  R2: 'r2',
});

export const STORAGE_BUCKETS = Object.freeze({
  PREVIEW: 'preview_bucket',
  ORIGINAL: 'original_bucket',
});

export const ACCESS_TYPES = Object.freeze({
  PUBLIC: 'public',
  SIGNED: 'signed',
});

export function normalizeStorageBucketType(bucketType, fallback = STORAGE_BUCKETS.PREVIEW) {
  if (typeof bucketType !== 'string') {
    return fallback;
  }

  const normalized = bucketType.trim().toLowerCase();
  if (normalized === STORAGE_BUCKETS.PREVIEW || normalized === STORAGE_BUCKETS.ORIGINAL) {
    return normalized;
  }

  return fallback;
}

export function normalizeAccessType(accessType, fallback = ACCESS_TYPES.PUBLIC) {
  if (typeof accessType !== 'string') {
    return fallback;
  }

  const normalized = accessType.trim().toLowerCase();
  if (normalized === ACCESS_TYPES.PUBLIC || normalized === ACCESS_TYPES.SIGNED) {
    return normalized;
  }

  return fallback;
}
