import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import BaseStorageProvider from './baseStorageProvider.js';
import {
  ACCESS_TYPES,
  STORAGE_BUCKETS,
  normalizeAccessType,
  normalizeStorageBucketType,
} from '../constants.js';

function toUploadContext(metadata = {}) {
  const entries = Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries.map(([key, value]) => [key, String(value)]));
}

function isNotFoundError(error) {
  return error?.http_code === 404 || error?.error?.http_code === 404 || error?.message === 'Resource not found';
}

function getFileBuffer(file) {
  if (Buffer.isBuffer(file)) {
    return file;
  }

  if (file && Buffer.isBuffer(file.buffer)) {
    return file.buffer;
  }

  throw new Error('Invalid file payload. Expected Buffer or multer file object.');
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getResourceTypeFromPath(objectPath) {
  const extension = path.extname(objectPath || '').toLowerCase();

  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.bmp', '.tiff', '.svg'].includes(extension)) {
    return 'image';
  }

  if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(extension)) {
    return 'video';
  }

  return 'raw';
}

function getResourceType(file, objectPath) {
  const mimeType = file?.mimetype || '';
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return getResourceTypeFromPath(objectPath);
}

function splitPublicIdAndFormat(publicId, resourceType) {
  if (resourceType !== 'image' && resourceType !== 'video') {
    return {
      publicId,
      format: undefined,
    };
  }

  const extension = path.extname(publicId || '').replace(/^\./, '').toLowerCase();
  if (!extension) {
    return {
      publicId,
      format: undefined,
    };
  }

  return {
    publicId,
    format: extension,
  };
}

export default class CloudinaryStorageProvider extends BaseStorageProvider {
  constructor(config) {
    super(config);

    const providerConfig = config.providerConfig || {};
    this.cloudName = providerConfig.cloudName;
    this.secure = providerConfig.secure !== false;
    this.privateCdn = Boolean(providerConfig.privateCdn);
    this.secureDistribution = providerConfig.secureDistribution || undefined;
    this.client = cloudinary;

    this.client.config({
      cloud_name: providerConfig.cloudName,
      api_key: providerConfig.apiKey,
      api_secret: providerConfig.apiSecret,
      secure: this.secure,
      private_cdn: this.privateCdn,
      secure_distribution: this.secureDistribution,
      urlAnalytics: false,
    });
  }

  getPublicId(objectPath, bucketType) {
    const key = this.normalizeKey(objectPath);
    const normalizedBucketType = normalizeStorageBucketType(bucketType, STORAGE_BUCKETS.PREVIEW);
    const bucketName = this.getBucketName(normalizedBucketType).replace(/^\/+|\/+$/g, '');
    return `${bucketName}/${key}`.replace(/\/{2,}/g, '/');
  }

  getDeliveryType(bucketType, accessType = ACCESS_TYPES.PUBLIC) {
    const normalizedBucketType = normalizeStorageBucketType(bucketType, STORAGE_BUCKETS.PREVIEW);
    const normalizedAccess = normalizeAccessType(accessType, ACCESS_TYPES.PUBLIC);

    if (normalizedBucketType === STORAGE_BUCKETS.ORIGINAL || normalizedAccess === ACCESS_TYPES.SIGNED) {
      return 'private';
    }

    return 'upload';
  }

  async upload(file, objectPath, options = {}) {
    const bucketType = normalizeStorageBucketType(options.bucketType, STORAGE_BUCKETS.PREVIEW);
    const publicId = this.getPublicId(objectPath, bucketType);
    const resourceType = getResourceType(file, objectPath);
    const buffer = getFileBuffer(file);

    const result = await new Promise((resolve, reject) => {
      const stream = this.client.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          type: this.getDeliveryType(bucketType),
          overwrite: true,
          invalidate: true,
          use_filename: false,
          unique_filename: false,
          context: toUploadContext(options.metadata),
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(uploadResult);
        }
      );

      stream.end(buffer);
    });

    const access =
      bucketType === STORAGE_BUCKETS.ORIGINAL ? ACCESS_TYPES.SIGNED : ACCESS_TYPES.PUBLIC;

    return {
      path: this.normalizeKey(objectPath),
      bucket: this.getBucketName(bucketType),
      etag: result.asset_id || result.public_id,
      size: buffer.length,
      url:
        access === ACCESS_TYPES.PUBLIC
          ? await this.generateAccessUrl(objectPath, { bucketType, access })
          : null,
    };
  }

  async delete(objectPath, options = {}) {
    const bucketType = normalizeStorageBucketType(options.bucketType, STORAGE_BUCKETS.PREVIEW);
    const publicId = this.getPublicId(objectPath, bucketType);
    const resourceType = getResourceTypeFromPath(objectPath);

    await this.client.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: this.getDeliveryType(bucketType),
      invalidate: true,
    });

    return true;
  }

  async exists(objectPath, options = {}) {
    const bucketType = normalizeStorageBucketType(options.bucketType, STORAGE_BUCKETS.ORIGINAL);
    const publicId = this.getPublicId(objectPath, bucketType);
    const resourceType = getResourceTypeFromPath(objectPath);

    try {
      await this.client.api.resource(publicId, {
        resource_type: resourceType,
        type: this.getDeliveryType(bucketType),
      });
      return true;
    } catch (error) {
      if (isNotFoundError(error)) {
        return false;
      }
      throw error;
    }
  }

  async generateAccessUrl(objectPath, options = {}) {
    const bucketType = normalizeStorageBucketType(options.bucketType, STORAGE_BUCKETS.PREVIEW);
    const accessType = normalizeAccessType(
      options.access,
      bucketType === STORAGE_BUCKETS.ORIGINAL ? ACCESS_TYPES.SIGNED : ACCESS_TYPES.PUBLIC
    );
    const publicId = this.getPublicId(objectPath, bucketType);
    const resourceType = getResourceTypeFromPath(objectPath);
    const delivery = splitPublicIdAndFormat(publicId, resourceType);

    if (accessType === ACCESS_TYPES.PUBLIC && bucketType !== STORAGE_BUCKETS.ORIGINAL) {
      return this.client.url(publicId, {
        resource_type: resourceType,
        type: this.getDeliveryType(bucketType, accessType),
        secure: this.secure,
        sign_url: false,
        format: delivery.format,
      });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + toPositiveInteger(
      options.expiresIn,
      this.getDefaultSignedUrlExpiry()
    );

    return this.client.utils.private_download_url(delivery.publicId, delivery.format, {
      resource_type: resourceType,
      type: this.getDeliveryType(bucketType, ACCESS_TYPES.SIGNED),
      expires_at: expiresAt,
      attachment: false,
      secure: this.secure,
    });
  }

  async get(objectPath, options = {}) {
    const bucketType = normalizeStorageBucketType(options.bucketType, STORAGE_BUCKETS.ORIGINAL);
    const access =
      bucketType === STORAGE_BUCKETS.ORIGINAL ? ACCESS_TYPES.SIGNED : ACCESS_TYPES.PUBLIC;
    const url = await this.generateAccessUrl(objectPath, {
      bucketType,
      access,
      expiresIn: options.expiresIn,
    });
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch Cloudinary asset "${objectPath}" (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  getInfo() {
    return {
      ...super.getInfo(),
      cloudName: this.cloudName,
    };
  }
}
