import express from 'express';
import streamingRouter from './streaming/router.js';
import recordingsRouter from './recordings/router.js';

const router = express.Router();

router.use('/streaming', streamingRouter);
router.use('/recordings', recordingsRouter);

export default router;