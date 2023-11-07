import express from 'express';
import { startStreaming, stopStreaming } from './controller.js';
import { requireCameraMiddleware } from '../../../middlewares.js';

const router = express.Router();

router.post('/:camera_id/start', requireCameraMiddleware, startStreaming);
router.post('/:camera_id/stop', requireCameraMiddleware, stopStreaming);

export default router;