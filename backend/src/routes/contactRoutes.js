/**
 * Contact Inquiry Routes
 */

import express from 'express';
import {
  submitInquiry,
  getAllInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
  getInquiryStats,
} from '../controllers/contactController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitInquiry);

// Admin routes
router.get('/', authenticate, authorize(['ADMIN']), getAllInquiries);
router.get('/stats', authenticate, authorize(['ADMIN']), getInquiryStats);
router.get('/:id', authenticate, authorize(['ADMIN']), getInquiryById);
router.patch('/:id/status', authenticate, authorize(['ADMIN']), updateInquiryStatus);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteInquiry);

export default router;
