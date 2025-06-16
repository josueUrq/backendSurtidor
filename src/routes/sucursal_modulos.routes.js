import { Router } from "express";
import {
  getAllModulos,
  getModulosDeSucursal,
  addModuloASucursal,
  removeModuloDeSucursal,
} from "../controllers/sucursal_modulos.controller.js";

const router = Router();

// Listar todos los módulos
router.get("/modulos", getAllModulos);
// Listar módulos de una sucursal
router.get("/sucursal/:id_sucursal/modulos", getModulosDeSucursal);
// Añadir un módulo a una sucursal
router.post("/sucursal/:id_sucursal/modulos", addModuloASucursal);
// Quitar un módulo de una sucursal
router.delete("/sucursal/:id_sucursal/modulos/:id_modulo", removeModuloDeSucursal);

export default router; 