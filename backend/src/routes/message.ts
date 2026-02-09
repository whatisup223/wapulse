import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    res.json({ message: 'Messages endpoint - Coming soon' });
});

export default router;
