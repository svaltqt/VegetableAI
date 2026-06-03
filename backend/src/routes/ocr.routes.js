import { Router } from 'express';
import { handleOcrUpload, startAiOcr, getAiOcr } from '../controllers/ocr.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

// OCR sincrónico (visión, espera la respuesta). Puede tardar.
router.post('/', authenticate, upload.single('image'), handleOcrUpload);

// OCR con IA asíncrono: inicia el trabajo y se consulta por jobId (no se cae
// en esperas largas).
router.post('/ai', authenticate, upload.single('image'), startAiOcr);
router.get('/ai/:jobId', authenticate, getAiOcr);

export default router;
