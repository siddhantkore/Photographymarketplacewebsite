import express from 'express';
import { upload, deleteFromS3 } from '../config/storage.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Upload media
router.post('/upload', authenticate, isAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: {
      url: req.file.location,
      key: req.file.key,
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
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

    await deleteFromS3(key);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
