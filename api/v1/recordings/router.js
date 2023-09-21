import express from 'express';
import { getRecordings, getRecording, createRecording, deleteRecording } from './controller.js';

const router = express.Router();

router.get('/', getRecordings);
router.get('/:filename', getRecording);
router.post('/', createRecording)
router.delete('/', deleteRecording)

export default router;