import express from 'express';
import { getRecordings, getRecording, createRecording, deleteRecording } from './controller.js';
import { requireCameraMiddleware } from '../../../middlewares.js';

const router = express.Router();

router.get('/', getRecordings);
router.get('/:camera_id/:filename', requireCameraMiddleware, getRecording);
router.post('/', createRecording)
router.delete('/', deleteRecording)

export default router;