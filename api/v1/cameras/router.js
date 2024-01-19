import express from 'express';
import { getCameras, getCamera, patchCamera } from './controller.js';
import { requireCameraIdToBeInteger, requireCameraToExist } from '../../../middlewares.js';

const router = express.Router();

router.get('/', getCameras);
router.get('/:camera_id', requireCameraToExist, getCamera);
router.patch('/:camera_id', requireCameraIdToBeInteger, patchCamera);

export default router;