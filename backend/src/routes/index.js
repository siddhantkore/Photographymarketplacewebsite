import express from 'express';
import authRoutes from './authRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import cartRoutes from './cartRoutes.js';
import orderRoutes from './orderRoutes.js';
import adRoutes from './adRoutes.js';
import mediaRoutes from './mediaRoutes.js';
import serviceRoutes from './serviceRoutes.js';
import contactRoutes from './contactRoutes.js';
import siteConfigRoutes from './siteConfigRoutes.js';
import blogRoutes from './blogRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/advertisements', adRoutes);
router.use('/admin/advertisements', adRoutes);
router.use('/media', mediaRoutes);
router.use('/services', serviceRoutes);
router.use('/contact', contactRoutes);
router.use('/site-config', siteConfigRoutes);
router.use('/blogs', blogRoutes);

export default router;
