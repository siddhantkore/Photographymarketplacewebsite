import S3StorageProvider, { encodeObjectPath } from './s3StorageProvider.js';

export default class R2StorageProvider extends S3StorageProvider {
  constructor(config) {
    super({
      ...config,
      providerConfig: {
        ...(config.providerConfig || {}),
        supportsAcl: false,
      },
    });

    this.endpoint = (config.providerConfig?.endpoint || '').replace(/\/+$/, '');
  }

  buildPublicUrl(bucketName, key, bucketType) {
    const customBaseUrl = this.getPublicBaseUrl(bucketType);
    const encodedKey = encodeObjectPath(key);

    if (customBaseUrl) {
      return `${customBaseUrl.replace(/\/+$/, '')}/${encodedKey}`;
    }

    if (!this.endpoint) {
      throw new Error(`Unable to build public URL for bucket "${bucketName}" without endpoint`);
    }

    return `${this.endpoint}/${bucketName}/${encodedKey}`;
  }
}

