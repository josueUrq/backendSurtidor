import { Router } from 'express';
import { getTanques, createTanque, updateTanque, deleteTanque } from '../controllers/tanques.controller.js';

const router = Router();

// Cambiando las rutas para que coincidan con el uso de prefijo "/api" en index.js
router.get('/', getTanques);      // Accesible como /api/tanques/
router.post('/', createTanque);   // Accesible como /api/tanques/
router.put('/:id', updateTanque); // Accesible como /api/tanques/:id
router.delete('/:id', deleteTanque); // Accesible como /api/tanques/:id

export default router;