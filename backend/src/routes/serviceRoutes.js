/**
 * Service Routes
 */

import express from 'express';
import {
  getServices,
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  reorderServices,
} from '../controllers/serviceController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);

// Admin routes
router.get('/admin/all', authenticate, authorize(['ADMIN']), getAllServices);
router.post('/', authenticate, authorize(['ADMIN']), createService);
router.put('/:id', authenticate, authorize(['ADMIN']), updateService);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteService);
router.post('/reorder', authenticate, authorize(['ADMIN']), reorderServices);

export default router;
