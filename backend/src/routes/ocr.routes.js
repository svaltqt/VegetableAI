import { Router } from 'express';
import { handleOcrUpload } from '../controllers/ocr.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// Endpoint enfocado único: POST /api/ocr
router.post('/', authenticate, upload.single('image'), handleOcrUpload);

export default router;
