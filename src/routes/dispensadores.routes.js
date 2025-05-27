import { Router } from "express";
import {
  getDispensadoresDeSucursal,
  deleteDispensadoresDeSucursal,
  createDispensadoresDeSucursal,
  updateDispensadoresDeSucursal,
  getDispensadoresDeSucursalActivo,
} from "../controllers/dispensadores.controller.js";

const router = Router();

router.get("/sucursal/:sucursalId", getDispensadoresDeSucursal);
router.get("/sucursal/activos/:sucursalId", getDispensadoresDeSucursalActivo);
router.delete("/:dispensadorId", deleteDispensadoresDeSucursal);
router.post("/",createDispensadoresDeSucursal);
router.put("/:dispensadorId",updateDispensadoresDeSucursal);

export default router;
