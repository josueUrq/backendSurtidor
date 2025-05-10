import { Router } from "express";
import {
  getDispensadoresDeSucursal,
  deleteDispensadoresDeSucursal,
  createDispensadoresDeSucursal,
  updateDispensadoresDeSucursal,
} from "../controllers/dispensadores.controller.js";

const router = Router();

router.get("/sucursal/:sucursalId", getDispensadoresDeSucursal);
router.delete("/:dispensadorId", deleteDispensadoresDeSucursal);
router.post("/",createDispensadoresDeSucursal);
router.put("/:dispensadorId",updateDispensadoresDeSucursal);

export default router;
