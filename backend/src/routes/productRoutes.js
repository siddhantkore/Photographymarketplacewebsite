import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, isAdmin, optionalAuth } from '../middlewares/auth.js';
import upload from '../storage/uploadMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);
router.post(
  '/',
  authenticate,
  isAdmin,
  upload.fields([
    { name: 'files', maxCount: 50 },
    { name: 'watermarkImage', maxCount: 1 },
  ]),
  createProduct
);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

export default router;
