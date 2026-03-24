import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/:id', getBlogById);

router.post('/', authenticate, isAdmin, createBlog);
router.put('/:id', authenticate, isAdmin, updateBlog);
router.delete('/:id', authenticate, isAdmin, deleteBlog);

export default router;
