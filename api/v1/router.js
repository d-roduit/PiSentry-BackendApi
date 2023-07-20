import express from 'express';
import detectionSessionsRouter from './detection_session/router.js';
import streamingRouter from './streaming/router.js';
import recordingsRouter from './recordings/router.js';

const router = express.Router();

router.use('/detection-sessions', detectionSessionsRouter);
router.use('/streaming', streamingRouter);
router.use('/recordings', recordingsRouter);

export default router;