import express from 'express';
import {
  getAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  getGoogleAdSettings,
  updateGoogleAdSettings,
} from '../controllers/adController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAdvertisements);

// Admin routes
router.post('/', authenticate, isAdmin, createAdvertisement);
router.put('/:id', authenticate, isAdmin, updateAdvertisement);
router.delete('/:id', authenticate, isAdmin, deleteAdvertisement);

// Google Ads settings
router.get('/google-ads/settings', getGoogleAdSettings);
router.put('/google-ads/settings', authenticate, isAdmin, updateGoogleAdSettings);

export default router;
