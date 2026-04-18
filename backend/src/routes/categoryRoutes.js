import express from 'express';
import prisma from '../config/database.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status.toUpperCase();

    const categories = await prisma.category.findMany({ where });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await prisma.product.count({
          where: {
            categories: {
              has: cat.slug,
            },
          },
        });
        return {
          ...cat,
          productCount: count,
          status: cat.status.toLowerCase(),
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
});

// Create category
router.post('/', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { name, slug, image, status } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image,
        status: status ? status.toUpperCase() : 'ACTIVE',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// Update category
router.put('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.status) updateData.status = updateData.status.toUpperCase();

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category,
    });
  } catch (error) {
    next(error);
  }
});

// Delete category
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.category.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
