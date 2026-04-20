import { Router } from 'express';
import { getProfile, updateProfile, deleteAccountData } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);          // R Leer datos de perfil y preferencias
router.put('/me', updateProfile);       // U Actualizar metadata o configuraciones
router.delete('/me', deleteAccountData);// D Destruir registro local de base de datos

export default router;
