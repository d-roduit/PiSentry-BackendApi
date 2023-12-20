import express from 'express';
import { startStreaming, stopStreaming } from './controller.js';
import { requireCameraToExist } from '../../../middlewares.js';

const router = express.Router();

router.post('/:camera_id/start', requireCameraToExist, startStreaming);
router.post('/:camera_id/stop', requireCameraToExist, stopStreaming);

export default router;