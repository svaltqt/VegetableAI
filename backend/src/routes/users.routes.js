import { Router } from 'express';
import multer from 'multer';
import { getProfile, updateProfile, deleteAccountData, postAvatar } from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 15 Megabytes
  }
});

router.use(authenticate);

router.get('/me', getProfile);          // R Leer datos de perfil y preferencias
router.put('/me', updateProfile);       // U Actualizar metadata o configuraciones
router.delete('/me', deleteAccountData);// D Destruir registro local de base de datos
router.post('/me/avatar', upload.single('avatar'), postAvatar); // C/U Subir avatar de perfil (max 15MB)

export default router;
