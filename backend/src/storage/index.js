import { getStorageProvider, getStorageProviderInfo } from './storageProviderFactory.js';

export {
  ACCESS_TYPES,
  STORAGE_BUCKETS,
  STORAGE_PROVIDERS,
  normalizeAccessType,
  normalizeStorageBucketType,
} from './constants.js';
export { loadStorageConfig } from './storageConfig.js';
export { getStorageProvider, getStorageProviderInfo } from './storageProviderFactory.js';

export const storageProvider = getStorageProvider();

export default storageProvider;

