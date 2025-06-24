import { Router } from "express";
import {
  getAllMantenimientos,
  createMantenimiento,
  updateMantenimiento,
  deleteMantenimiento,
  getTiposMantenimiento
} from "../controllers/dispensador_mantenimiento.controller.js";

const router = Router();

router.get("/mantenimientos", getAllMantenimientos);
router.post("/mantenimientos", createMantenimiento);
router.put("/mantenimientos/:id", updateMantenimiento);
router.delete("/mantenimientos/:id", deleteMantenimiento);
router.get("/tipos", getTiposMantenimiento);

export default router; 