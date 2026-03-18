import express from 'express';
import {
  createTradeRequest,
  getUserTrades,
  regenerateExchangeCode,
  respondToTrade,
  verifyExchangeCode,
} from '../controllers/tradeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/request', protect, createTradeRequest);
router.put('/respond', protect, respondToTrade);
router.put('/exchange/verify', protect, verifyExchangeCode);
router.post('/exchange/regenerate', protect, regenerateExchangeCode);
router.get('/user', protect, getUserTrades);

export default router;
