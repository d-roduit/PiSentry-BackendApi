import express from 'express';
import { getThumbnail } from './controller.js';

const router = express.Router();

router.get('/:thumbnail_filename', getThumbnail);

export default router;