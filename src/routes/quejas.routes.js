import { Router } from "express";
import {
  getQuejasSugerencias,
  crearQuejaSugerencia,
  getQuejaSugerencia,
  actualizarQuejaSugerencia,
  eliminarQuejaSugerencia,
  getEstadisticasQuejas,
} from "../controllers/quejas.controller.js";

const router = Router();

// Rutas públicas (sin autenticación)
router.post("/public", crearQuejaSugerencia); // Para que cualquiera pueda crear

// Rutas protegidas (solo administradores)
router.get("/", getQuejasSugerencias);
router.get("/estadisticas", getEstadisticasQuejas);
router.get("/:id", getQuejaSugerencia);
router.put("/:id", actualizarQuejaSugerencia);
router.delete("/:id", eliminarQuejaSugerencia);

export default router;