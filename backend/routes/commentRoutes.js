import express from 'express';
import {
  getBlogComments,
  getAllComments,
  createComment,
  approveComment,
  deleteComment,
  getCommentStats
} from '../controllers/commentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.get('/blog/:blogId', asyncHandler(getBlogComments));
router.post('/', asyncHandler(createComment));

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.get('/', asyncHandler(getAllComments));
router.get('/stats', asyncHandler(getCommentStats));
router.patch('/:id/approve', asyncHandler(approveComment));
router.delete('/:id', deleteComment);

export default router;
