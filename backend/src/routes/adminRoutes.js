import express from 'express';
import { authenticate, isAdmin } from '../middlewares/auth.js';
import { getDashboardStats } from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', authenticate, isAdmin, getDashboardStats);

export default router;
