import { Router } from "express";
import {
  getSucursales,
  getAllSucursales,
  getSucursal,
  createSucursal,
  updateSucursal,
  deleteSucursal,
  reactivarSucursal,
  getSucursalesConProductos
} from "../controllers/sucursales.controller.js";

const router = Router();

// Rutas para sucursales
router.get("/", getSucursales);
router.get("/all", getAllSucursales);
router.get("/with-productos", getSucursalesConProductos);
router.get("/:id", getSucursal);
router.post("/", createSucursal);
router.put("/:id", updateSucursal);
router.put("/:id/reactivar", reactivarSucursal);
router.delete("/:id", deleteSucursal);

export default router;