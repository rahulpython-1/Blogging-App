import express from 'express';
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getPublishers
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(asyncHandler(getUsers))
  .post(asyncHandler(createUser));

router.get('/publishers', asyncHandler(getPublishers));

router.route('/:id')
  .get(asyncHandler(getUser))
  .put(asyncHandler(updateUser))
  .delete(asyncHandler(deleteUser));

export default router;
