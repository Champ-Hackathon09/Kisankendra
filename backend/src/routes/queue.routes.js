import express from 'express';
import { getCentreQueue, callNextToken } from '../controllers/queue.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:centreId', getCentreQueue);
router.post('/:centreId/next', verifyToken, requireRole('OPERATOR', 'ADMIN'), callNextToken);

export default router;
