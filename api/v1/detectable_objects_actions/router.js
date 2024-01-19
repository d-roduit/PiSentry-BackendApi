import express from 'express';
import { getDetectableObjectsActions, getDetectableObjectAction, patchDetectableObjectAction } from './controller.js';
import { requireCameraToExist, requireCameraIdToBeInteger } from '../../../middlewares.js';

const router = express.Router();

router.get('/:camera_id', requireCameraToExist, getDetectableObjectsActions);
router.get('/:camera_id/:object_type', requireCameraToExist, getDetectableObjectAction);
router.patch('/:camera_id/:object_id', requireCameraIdToBeInteger, patchDetectableObjectAction);

export default router;