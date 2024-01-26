import express from 'express';
import { sendNotifications, createSubscription } from './controller.js';
import { requireCameraIdToBeInteger, requireCameraToExist } from '../../../middlewares.js';

const router = express.Router();

router.post('/:camera_id/send', requireCameraIdToBeInteger, sendNotifications);
router.post('/:camera_id/subscribe', requireCameraToExist, createSubscription);

export default router;