import express from 'express';
import {
  bookToken,
  getMyTokens,
  getTokenDetails,
  updateTokenStatus,
  cancelToken,
  getAnalytics,
  getSlotAvailability,
  getCropStockDetails,
} from '../controllers/token.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/slots-availability', getSlotAvailability);
router.get('/crop-stocks', getCropStockDetails);
router.post('/book', verifyToken, requireRole('FARMER'), bookToken);
router.get('/my-tokens', verifyToken, getMyTokens);
router.get('/analytics', getAnalytics);
router.get('/:id', verifyToken, getTokenDetails);
router.patch('/:id/cancel', verifyToken, cancelToken);
router.patch('/:id/status', verifyToken, updateTokenStatus);

export default router;

