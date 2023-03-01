import express from 'express';
import { startStreaming, stopStreaming } from './controller.js';

const router = express.Router();

router.post('/start', startStreaming);
router.post('/stop', stopStreaming);

export default router;