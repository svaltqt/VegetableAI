import { Router } from 'express';
import { getInventory, postProduct, putProduct, deleteProduct } from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Middleware enfocado para proteger todas las ramas
router.use(authenticate);

router.get('/', getInventory);        // R general 
router.post('/', postProduct);        // C agregar nuevo vegetal
router.put('/:id', putProduct);       // U modificar caducidad
router.delete('/:id', deleteProduct); // D eliminar un registro

export default router;
