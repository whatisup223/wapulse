import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    res.json({ message: 'Campaigns endpoint - Coming soon' });
});

export default router;
