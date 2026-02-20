import express from 'express';
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  getAllOrders,
  generateDownloadLink,
} from '../controllers/orderController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, getUserOrders);
router.post('/', authenticate, createOrder);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/verify-payment', authenticate, verifyPayment);
router.post('/generate-link', authenticate, generateDownloadLink);

// Admin routes
router.get('/admin/all', authenticate, isAdmin, getAllOrders);

export default router;
