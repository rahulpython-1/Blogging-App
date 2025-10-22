import express from 'express';
import { login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Wrap async handlers to automatically catch errors
router.post('/login', asyncHandler(login));
router.post('/logout', protect, asyncHandler(logout));
router.get('/me', protect, asyncHandler(getMe));
router.put('/profile', protect, asyncHandler(updateProfile));

export default router;
