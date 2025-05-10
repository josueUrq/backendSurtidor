import express from "express";
import {
  marcarEntrada,
  marcarSalida,
  obtenerRegistroHoy,
  obtenerHistorialAsistencia,
  obtenerTodasLasAsistencia,
} from "../controllers/asistencia.controller.js";

const router = express.Router();

router.post("/entrada", marcarEntrada);
router.put("/salida", marcarSalida);
router.get("/hoy/:id_usuario", obtenerRegistroHoy);
router.get("/historial/:id_usuario", obtenerHistorialAsistencia);
router.get("/historial",obtenerTodasLasAsistencia)
export default router;
