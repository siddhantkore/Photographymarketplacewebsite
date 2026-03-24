import express from 'express';
import {
  createOrder,
  verifyPayment,
  handleRazorpayWebhook,
  getUserOrders,
  getOrderById,
  getAllOrders,
  generateDownloadLink,
} from '../controllers/orderController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.post('/webhook/razorpay', handleRazorpayWebhook);
// Admin routes (must be declared before "/:id" to avoid route shadowing)
router.get('/admin/all', authenticate, isAdmin, getAllOrders);
router.get('/', authenticate, getUserOrders);
router.post('/', authenticate, createOrder);
router.get('/:id', authenticate, getOrderById);
router.post('/:id/verify-payment', authenticate, verifyPayment);
router.post('/generate-link', authenticate, generateDownloadLink);

export default router;
