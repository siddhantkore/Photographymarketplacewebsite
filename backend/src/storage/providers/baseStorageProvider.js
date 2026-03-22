export default class BaseStorageProvider {
  constructor(config) {
    this.provider = config.provider;
    this.buckets = config.buckets;
    this.publicBaseUrls = config.publicBaseUrls || {};
    this.defaultSignedUrlExpiry = config.defaultSignedUrlExpiry || 3600;
  }

  getBucketName(bucketType) {
    const bucketName = this.buckets[bucketType];
    if (!bucketName) {
      throw new Error(`No bucket configured for bucketType "${bucketType}"`);
    }
    return bucketName;
  }

  getPublicBaseUrl(bucketType) {
    return this.publicBaseUrls[bucketType] || '';
  }

  getProviderName() {
    return this.provider;
  }

  getDefaultSignedUrlExpiry() {
    return this.defaultSignedUrlExpiry;
  }

  normalizeKey(objectPath) {
    if (!objectPath || typeof objectPath !== 'string') {
      throw new Error('Storage object path is required');
    }

    return objectPath.replace(/^\/+/, '');
  }

  getInfo() {
    return {
      provider: this.provider,
      buckets: this.buckets,
    };
  }

  async upload() {
    throw new Error('upload() must be implemented by storage provider');
  }

  async delete() {
    throw new Error('delete() must be implemented by storage provider');
  }

  async get() {
    throw new Error('get() must be implemented by storage provider');
  }

  async generateAccessUrl() {
    throw new Error('generateAccessUrl() must be implemented by storage provider');
  }

  async exists() {
    throw new Error('exists() must be implemented by storage provider');
  }
}

