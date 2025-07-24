import express from 'express';
import { 
  initiatePhonePePayment, 
  verifyPhonePePayment, 
  paymentStatus, 
  checkPaymentStatus,
  processRefund,
  checkRefundStatus,
  handlePhonePeWebhook
} from '../controllers/payment.controller.js';
import { organizerMiddleware } from '../middlewares/organizer.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// // Public routes
router.get('/status', paymentStatus);
router.get('/status/:transactionId', checkPaymentStatus);

// // Payment routes for organizers
router.post('/phonepe/initiate', initiatePhonePePayment);
router.post('/phonepe/callback', verifyPhonePePayment);

// // Payment routes for players (using player auth middleware)
router.post('/player/phonepe/initiate', authMiddleware, initiatePhonePePayment);

// // New refund routes (restricted to organizers only)
router.post('/phonepe/refund', organizerMiddleware, processRefund);
router.get('/phonepe/refund/:transactionId/:refundId', organizerMiddleware, checkRefundStatus);

// // Webhook for real-time payment updates from PhonePe
router.post('/phonepe/webhook', handlePhonePeWebhook);

export default router;