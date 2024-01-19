import express from 'express';
import camerasRouter from './cameras/router.js';
import detectionSessionsRouter from './detection_sessions/router.js';
import streamingRouter from './streaming/router.js';
import recordingsRouter from './recordings/router.js';
import thumbnailsRouter from './thumbnails/router.js';
import notificationsRouter from './notifications/router.js';
import detectableObjectsRouter from './detectable_objects/router.js';
import detectionActionsRouter from './detection_actions/router.js';

const router = express.Router();

router.use('/cameras', camerasRouter);
router.use('/detection-sessions', detectionSessionsRouter);
router.use('/streaming', streamingRouter);
router.use('/recordings', recordingsRouter);
router.use('/thumbnails', thumbnailsRouter);
router.use('/notifications', notificationsRouter);
router.use('/detectable-objects', detectableObjectsRouter);
router.use('/detection-actions', detectionActionsRouter);

export default router;