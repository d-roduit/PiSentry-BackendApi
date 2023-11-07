import express from 'express';
import { getThumbnail } from './controller.js';
import { requireCameraMiddleware } from '../../../middlewares.js';

const router = express.Router();

router.get('/:camera_id/:thumbnail_filename', requireCameraMiddleware, getThumbnail);

export default router;