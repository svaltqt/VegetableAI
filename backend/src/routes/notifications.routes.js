import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { postSubscribe, deleteSubscribe } from '../controllers/notifications.controller.js';

const router = Router();

// Importante: exportar la clave pública para que el frontend la lea si es necesario (opcional)
router.get('/vapid-public-key', (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

router.use(authenticate);
router.post('/subscribe', postSubscribe);
router.delete('/subscribe', deleteSubscribe);

export default router;
