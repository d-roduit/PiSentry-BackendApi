import express from 'express';
import { getDetectionActions } from './controller.js';

const router = express.Router();

router.get('/', getDetectionActions);

export default router;