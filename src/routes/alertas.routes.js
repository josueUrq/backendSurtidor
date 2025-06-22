import { Router } from "express";
import {
  getAlertasInventario,
  getEstadisticasAlertas,
  verificarStocksManual,
  resolverAlerta,
  getAlertasPendientesUsuario,
  testAlertas,
} from "../controllers/alertas.controller.js";

const router = Router();

// Ruta de test (agregar primero para debugging)
router.get("/test", testAlertas);

// Rutas principales para gestión de alertas
router.get("/", getAlertasInventario);
router.get("/estadisticas", getEstadisticasAlertas);
router.get("/usuario/:usuario_id/pendientes", getAlertasPendientesUsuario);

// Acciones sobre alertas
router.post("/verificar-manual", verificarStocksManual);
router.delete("/resolver/:alerta_id", resolverAlerta);

export default router;