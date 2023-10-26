import express from 'express';
import { getCameras } from './controller.js';

const router = express.Router();

router.get('/', getCameras);

export default router;