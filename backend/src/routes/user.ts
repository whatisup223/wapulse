import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getProfile, updateProfile } from '../controllers/user';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/user/profile - Get user profile
router.get('/profile', getProfile);

// PUT /api/user/profile - Update user profile
router.put('/profile', updateProfile);

export default router;
