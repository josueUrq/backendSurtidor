import { Router } from "express";
import {
  getSeguridadSucursal,
  createSeguridadSucursal,
  updateSeguridadSucursal,
  deleteSeguridadSucursal,
} from "../controllers/seguridadSucursal.controller.js";

const router = Router();

router.get("/", getSeguridadSucursal);
router.post("/", createSeguridadSucursal);
router.put("/:id", updateSeguridadSucursal);
router.delete("/:id", deleteSeguridadSucursal);

export default router;
