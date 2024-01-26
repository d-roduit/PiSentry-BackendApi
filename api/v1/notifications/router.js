import express from 'express';
import { sendNotifications, createSubscription, getSubscriptions, removeSubscription } from './controller.js';
import { requireCameraIdToBeInteger, requireCameraToExist } from '../../../middlewares.js';

const router = express.Router();

router.get('/:camera_id/', requireCameraIdToBeInteger, getSubscriptions)
router.post('/:camera_id/send', requireCameraIdToBeInteger, sendNotifications);
router.post('/:camera_id/subscribe', requireCameraToExist, createSubscription);
router.delete('/:camera_id/', requireCameraIdToBeInteger, removeSubscription);

export default router;