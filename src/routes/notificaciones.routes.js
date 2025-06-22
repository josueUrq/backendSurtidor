import { Router } from "express";
import {
  getNotificacionesUsuario,
  contarNotificacionesNoLeidas,
  marcarComoLeida,
  marcarTodasComoLeidas,
  crearNotificacionStockBajo,
  verificarStocksBajos,
  eliminarNotificacion,
  getEstadisticasNotificaciones,
   getNotificacionesSimple,
  vincularNotificacionesExistentes
} from "../controllers/notificaciones.controller.js";

const router = Router();

// Rutas para notificaciones de usuario
router.get("/usuario/:id_usuario", getNotificacionesUsuario);
router.get("/usuario/:id_usuario/count", contarNotificacionesNoLeidas);
router.put("/marcar-leida/:id", marcarComoLeida);
router.put("/usuario/:id_usuario/marcar-todas-leidas", marcarTodasComoLeidas);
router.delete("/:id", eliminarNotificacion);
router.get("/simple/:id_usuario", getNotificacionesSimple);

// Rutas para gestión de alertas de stock
router.post("/stock-bajo", crearNotificacionStockBajo);
router.post("/verificar-stocks", verificarStocksBajos);
router.post("/vincular-existentes", vincularNotificacionesExistentes);

// Estadísticas
router.get("/estadisticas", getEstadisticasNotificaciones);

export default router;