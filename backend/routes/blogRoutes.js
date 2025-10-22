import express from 'express';
import {
  getBlogs,
  getBlog,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  togglePublish,
  generateBlog,
  improveBlog,
  getBlogIdeas,
  getBlogStats
} from '../controllers/blogController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getBlogs));
router.get('/slug/:slug', asyncHandler(getBlogBySlug));
router.get('/:id', asyncHandler(getBlog));

// Protected routes
router.use(protect);

router.post('/', asyncHandler(createBlog));
router.post('/generate', asyncHandler(generateBlog));
router.post('/ideas', asyncHandler(getBlogIdeas));
router.get('/stats/all', asyncHandler(getBlogStats));

router.route('/:id')
  .put(asyncHandler(updateBlog))
  .delete(asyncHandler(deleteBlog));

router.post('/:id/improve', asyncHandler(improveBlog));

// Admin only routes
router.patch('/:id/publish', authorize('admin'), asyncHandler(togglePublish));

export default router;
