import { Router } from "express";
import { getHistorialVentas, deleteVenta  } from "../controllers/historialventas.controller.js";

const router = Router();

// Ruta para obtener historial de ventas
router.get("/", getHistorialVentas);
router.delete("/:id", deleteVenta);
export default router;
