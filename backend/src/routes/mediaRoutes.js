import express from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.js';
import upload from '../storage/uploadMiddleware.js';
import storageProvider, {
  ACCESS_TYPES,
  STORAGE_BUCKETS,
  normalizeStorageBucketType,
} from '../storage/index.js';
import path from 'path';

const router = express.Router();

const DEFAULT_SIGNED_URL_EXPIRY = 3600;

const sanitizeFolder = (folder) => {
  const sanitized = String(folder || 'misc')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]/g, '')
    .replace(/^\/+|\/+$/g, '');

  return sanitized || 'misc';
};

const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
};

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Upload media
router.post('/upload', authenticate, isAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const folder = sanitizeFolder(req.body.type);
    const objectPath = `${folder}/${generateFileName(req.file.originalname)}`;
    const bucketType = normalizeStorageBucketType(req.body.bucketType, STORAGE_BUCKETS.PREVIEW);

    await storageProvider.upload(req.file, objectPath, {
      bucketType,
      contentType: req.file.mimetype,
      metadata: {
        fieldName: req.file.fieldname,
        originalName: req.file.originalname,
        uploadedBy: String(req.user.userId),
      },
      // Keep preview uploads publicly accessible by default.
      acl: bucketType === STORAGE_BUCKETS.PREVIEW ? 'public-read' : undefined,
    });

    const access =
      bucketType === STORAGE_BUCKETS.ORIGINAL ? ACCESS_TYPES.SIGNED : ACCESS_TYPES.PUBLIC;

    const url = await storageProvider.generateAccessUrl(objectPath, {
      bucketType,
      access,
      expiresIn: toPositiveInteger(req.body.expiresIn, DEFAULT_SIGNED_URL_EXPIRY),
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url,
        key: objectPath,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete media
router.delete('/delete', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'File key is required',
      });
    }

    const bucketType = normalizeStorageBucketType(req.body.bucketType, STORAGE_BUCKETS.PREVIEW);
    await storageProvider.delete(key, { bucketType });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
