import express from 'express';
import { getCart, addToCart, removeFromCart, clearCart } from '../controllers/cartController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authenticate, getCart);
router.post('/', authenticate, addToCart);
router.delete('/', authenticate, clearCart);
router.delete('/items/:productId/:resolution', authenticate, removeFromCart);

export default router;
