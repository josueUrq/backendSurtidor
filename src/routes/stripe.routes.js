import { Router } from 'express';
import { crearSessionPago,verificarFactura   } from '../controllers/stripe.controller.js';

const router = Router();

// Ruta para crear sesión de Stripe
router.post('/crear-session', crearSessionPago);
router.post('/verificar-factura', verificarFactura);

export default router;
