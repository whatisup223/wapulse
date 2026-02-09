import { Router } from 'express';
import { register, login, logout, refreshAccessToken } from '../controllers/auth';

const router = Router();

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshAccessToken);

export default router;
