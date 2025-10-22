import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getCategories));
router.get('/:id', asyncHandler(getCategory));

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.post('/', asyncHandler(createCategory));
router.route('/:id')
  .put(asyncHandler(updateCategory))
  .delete(asyncHandler(deleteCategory));

export default router;
