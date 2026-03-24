import { STORAGE_BUCKETS, STORAGE_PROVIDERS } from './constants.js';

const DEFAULT_SIGNED_URL_EXPIRY = 3600;

function toBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') {
    return true;
  }

  if (normalized === 'false') {
    return false;
  }

  return defaultValue;
}

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseProvider(provider) {
  if (typeof provider !== 'string') {
    return STORAGE_PROVIDERS.MINIO;
  }

  const normalized = provider.trim().toLowerCase();
  if (normalized === STORAGE_PROVIDERS.R2) {
    return STORAGE_PROVIDERS.R2;
  }

  if (normalized === STORAGE_PROVIDERS.S3) {
    return STORAGE_PROVIDERS.S3;
  }

  return STORAGE_PROVIDERS.MINIO;
}

function requireValue(value, fieldName) {
  if (!value) {
    throw new Error(`Missing required storage configuration: ${fieldName}`);
  }
  return value;
}

export function loadStorageConfig(env = process.env) {
  const provider = parseProvider(env.STORAGE_PROVIDER);

  const previewBucketName =
    env.PREVIEW_BUCKET_NAME || env.MINIO_PREVIEW_BUCKET || env.AWS_S3_BUCKET;
  const originalBucketName =
    env.ORIGINAL_BUCKET_NAME || env.MINIO_ORIGINAL_BUCKET || env.AWS_S3_BUCKET;

  requireValue(previewBucketName, 'PREVIEW_BUCKET_NAME');
  requireValue(originalBucketName, 'ORIGINAL_BUCKET_NAME');

  const baseConfig = {
    provider,
    buckets: {
      [STORAGE_BUCKETS.PREVIEW]: previewBucketName,
      [STORAGE_BUCKETS.ORIGINAL]: originalBucketName,
    },
    publicBaseUrls: {
      [STORAGE_BUCKETS.PREVIEW]: env.PREVIEW_PUBLIC_BASE_URL || '',
      [STORAGE_BUCKETS.ORIGINAL]: env.ORIGINAL_PUBLIC_BASE_URL || '',
    },
    defaultSignedUrlExpiry: toInteger(env.STORAGE_SIGNED_URL_EXPIRY, DEFAULT_SIGNED_URL_EXPIRY),
  };

  if (provider === STORAGE_PROVIDERS.R2) {
    const accountId = env.R2_ACCOUNT_ID || '';
    const endpoint = env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');

    const accessKeyId = requireValue(
      env.R2_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID,
      'R2_ACCESS_KEY_ID'
    );
    const secretAccessKey = requireValue(
      env.R2_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY,
      'R2_SECRET_ACCESS_KEY'
    );
    requireValue(endpoint, 'R2_ENDPOINT or R2_ACCOUNT_ID');

    return {
      ...baseConfig,
      providerConfig: {
        accessKeyId,
        secretAccessKey,
        region: env.R2_REGION || 'auto',
        endpoint,
        accountId,
        forcePathStyle: toBoolean(env.R2_FORCE_PATH_STYLE, true),
      },
    };
  }

  if (provider === STORAGE_PROVIDERS.MINIO) {
    const endpoint = requireValue(
      env.MINIO_ENDPOINT || env.AWS_S3_ENDPOINT,
      'MINIO_ENDPOINT'
    );
    const accessKeyId = requireValue(
      env.MINIO_ACCESS_KEY || env.MINIO_ROOT_USER || env.AWS_ACCESS_KEY_ID,
      'MINIO_ACCESS_KEY'
    );
    const secretAccessKey = requireValue(
      env.MINIO_SECRET_KEY || env.MINIO_ROOT_PASSWORD || env.AWS_SECRET_ACCESS_KEY,
      'MINIO_SECRET_KEY'
    );

    return {
      ...baseConfig,
      providerConfig: {
        accessKeyId,
        secretAccessKey,
        region: env.MINIO_REGION || env.AWS_REGION || 'us-east-1',
        endpoint,
        forcePathStyle: toBoolean(env.MINIO_FORCE_PATH_STYLE, true),
        supportsAcl: false,
      },
    };
  }

  return {
    ...baseConfig,
    providerConfig: {
      accessKeyId: requireValue(env.AWS_ACCESS_KEY_ID, 'AWS_ACCESS_KEY_ID'),
      secretAccessKey: requireValue(env.AWS_SECRET_ACCESS_KEY, 'AWS_SECRET_ACCESS_KEY'),
      region: requireValue(env.AWS_REGION, 'AWS_REGION'),
      endpoint: env.AWS_S3_ENDPOINT || '',
      forcePathStyle: toBoolean(env.S3_FORCE_PATH_STYLE, false),
    },
  };
}
