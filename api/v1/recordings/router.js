import express from 'express';
import { getRecording, getRecordings } from './controller.js';

const router = express.Router();

router.get('/', getRecordings);
router.get('/:filename', getRecording);

export default router;