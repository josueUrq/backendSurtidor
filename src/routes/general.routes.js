import { Router } from "express";
import {
  getSucursales,
  getRoles,
  getInfoSucursal,
} from "../controllers/general.controller.js";

const router = Router();

router.get("/sucursales", getSucursales);
router.get("/infoSucursal", getInfoSucursal);

export default router;
