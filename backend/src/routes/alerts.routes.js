import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { listAlerts, patchAlert, postSeenAll } from '../controllers/alerts.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listAlerts);
router.patch('/:id', patchAlert);
router.post('/seen-all', postSeenAll);

export default router;
