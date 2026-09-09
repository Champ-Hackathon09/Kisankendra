import express from 'express';
import {
  getAllCentres,
  getCentreById,
  updateCentreStatus,
  createCentre,
} from '../controllers/centre.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllCentres);
router.get('/:id', getCentreById);
router.post('/', verifyToken, requireRole('ADMIN', 'OPERATOR'), createCentre);
router.patch('/:id/status', verifyToken, requireRole('ADMIN', 'OPERATOR'), updateCentreStatus);

export default router;
