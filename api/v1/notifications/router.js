import express from 'express';
import { sendNotifications, createSubscription } from './controller.js';

const router = express.Router();

router.post('/send', sendNotifications);
router.post('/subscribe', createSubscription);

export default router;