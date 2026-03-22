import { STORAGE_PROVIDERS } from './constants.js';
import { loadStorageConfig } from './storageConfig.js';
import S3StorageProvider from './providers/s3StorageProvider.js';
import R2StorageProvider from './providers/r2StorageProvider.js';

let providerInstance;

export function createStorageProvider(config = loadStorageConfig()) {
  if (config.provider === STORAGE_PROVIDERS.R2) {
    return new R2StorageProvider(config);
  }

  return new S3StorageProvider(config);
}

export function getStorageProvider() {
  if (!providerInstance) {
    providerInstance = createStorageProvider();
  }

  return providerInstance;
}

export function getStorageProviderInfo() {
  const provider = getStorageProvider();
  return provider.getInfo();
}

