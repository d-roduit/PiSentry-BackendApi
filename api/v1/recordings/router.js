import express from 'express';
import { createRecording, getRecording, getRecordings } from './controller.js';

const router = express.Router();

router.get('/', getRecordings);
router.get('/:filename', getRecording);
router.post('/', createRecording)

export default router;