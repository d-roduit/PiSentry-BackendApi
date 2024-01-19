import express from 'express';
import { getDetectableObjects } from './controller.js';

const router = express.Router();

router.get('/', getDetectableObjects);

export default router;