import AWS from 'aws-sdk';
import BaseStorageProvider from './baseStorageProvider.js';
import { ACCESS_TYPES, STORAGE_BUCKETS, normalizeAccessType } from '../constants.js';

export function encodeObjectPath(objectPath) {
  return objectPath
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function getUploadBody(file) {
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

export default class S3StorageProvider extends BaseStorageProvider {
  constructor(config) {
    super(config);

    const providerConfig = config.providerConfig || {};
    this.region = providerConfig.region;
    this.endpoint = providerConfig.endpoint || '';
    this.supportsAcl = providerConfig.supportsAcl !== false;

    const clientConfig = {
      accessKeyId: providerConfig.accessKeyId,
      secretAccessKey: providerConfig.secretAccessKey,
      region: providerConfig.region,
      signatureVersion: 'v4',
      s3ForcePathStyle: Boolean(providerConfig.forcePathStyle),
    };

    if (providerConfig.endpoint) {
      clientConfig.endpoint = providerConfig.endpoint;
    }

    this.client = new AWS.S3(clientConfig);
  }

  async upload(file, objectPath, options = {}) {
    const key = this.normalizeKey(objectPath);
    const bucketType = options.bucketType || STORAGE_BUCKETS.PREVIEW;
    const bucketName = this.getBucketName(bucketType);
    const body = getUploadBody(file);

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: options.contentType || file?.mimetype || 'application/octet-stream',
    };

    if (options.metadata && typeof options.metadata === 'object') {
      params.Metadata = options.metadata;
    }

    if (options.cacheControl) {
      params.CacheControl = options.cacheControl;
    }

    if (this.supportsAcl && options.acl) {
      params.ACL = options.acl;
    }

    const result = await this.client.upload(params).promise();

    return {
      path: key,
      bucket: bucketName,
      etag: result.ETag,
      size: body.length,
      url: result.Location || null,
    };
  }

  async delete(objectPath, options = {}) {
    const key = this.normalizeKey(objectPath);
    const bucketType = options.bucketType || STORAGE_BUCKETS.PREVIEW;
    const bucketName = this.getBucketName(bucketType);

    await this.client
      .deleteObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    return true;
  }

  async get(objectPath, options = {}) {
    const key = this.normalizeKey(objectPath);
    const bucketType = options.bucketType || STORAGE_BUCKETS.ORIGINAL;
    const bucketName = this.getBucketName(bucketType);

    const result = await this.client
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();

    return result.Body;
  }

  async exists(objectPath, options = {}) {
    const key = this.normalizeKey(objectPath);
    const bucketType = options.bucketType || STORAGE_BUCKETS.ORIGINAL;
    const bucketName = this.getBucketName(bucketType);

    try {
      await this.client
        .headObject({
          Bucket: bucketName,
          Key: key,
        })
        .promise();
      return true;
    } catch (error) {
      if (error?.code === 'NotFound' || error?.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  async generateAccessUrl(objectPath, options = {}) {
    const key = this.normalizeKey(objectPath);
    const bucketType = options.bucketType || STORAGE_BUCKETS.PREVIEW;
    const bucketName = this.getBucketName(bucketType);
    const accessType = normalizeAccessType(options.access, ACCESS_TYPES.PUBLIC);

    if (accessType === ACCESS_TYPES.PUBLIC) {
      return this.buildPublicUrl(bucketName, key, bucketType);
    }

    const params = {
      Bucket: bucketName,
      Key: key,
      Expires: toPositiveInteger(options.expiresIn, this.getDefaultSignedUrlExpiry()),
    };

    if (options.responseContentType) {
      params.ResponseContentType = options.responseContentType;
    }

    if (options.responseContentDisposition) {
      params.ResponseContentDisposition = options.responseContentDisposition;
    }

    return this.client.getSignedUrlPromise('getObject', params);
  }

  buildPublicUrl(bucketName, key, bucketType) {
    const customBaseUrl = this.getPublicBaseUrl(bucketType);
    const encodedKey = encodeObjectPath(key);

    if (customBaseUrl) {
      return `${customBaseUrl.replace(/\/+$/, '')}/${encodedKey}`;
    }

    return `https://${bucketName}.s3.${this.region}.amazonaws.com/${encodedKey}`;
  }
}
