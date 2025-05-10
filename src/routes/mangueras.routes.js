import { Router } from "express";
import {
  getManguerasDeDispensador,
  createMangueraDeSucursal,
  updateDispensadoresDeSucursal,
  deletemangueraDeSucursal,
} from "../controllers/mangueras.controller.js";

const router = Router();

router.get("/dispensador/:dispensadorId", getManguerasDeDispensador);
router.post("/", createMangueraDeSucursal);
router.put("/:mangueraId", updateDispensadoresDeSucursal);
router.delete("/:mangueraId", deletemangueraDeSucursal);

export default router;
