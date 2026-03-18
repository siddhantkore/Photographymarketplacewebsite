/**
 * Site Configuration Routes
 */

import express from 'express';
import {
  getSiteConfig,
  getFullSiteConfig,
  updateSiteConfig,
} from '../controllers/siteConfigController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSiteConfig);

// Admin routes
router.get('/full', authenticate, authorize(['ADMIN']), getFullSiteConfig);
router.put('/', authenticate, authorize(['ADMIN']), updateSiteConfig);

export default router;
