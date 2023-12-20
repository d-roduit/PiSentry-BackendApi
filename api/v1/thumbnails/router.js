import express from 'express';
import { getThumbnail } from './controller.js';
import { requireCameraToExist } from '../../../middlewares.js';

const router = express.Router();

router.get('/:camera_id/:thumbnail_filename', requireCameraToExist, getThumbnail);

export default router;