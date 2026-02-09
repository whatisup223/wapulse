import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/sessions - Get all sessions
router.get('/', async (req, res) => {
    res.json({ message: 'Sessions endpoint - Coming soon' });
});

// POST /api/sessions - Create new session
router.post('/', async (req, res) => {
    res.json({ message: 'Create session - Coming soon' });
});

export default router;
