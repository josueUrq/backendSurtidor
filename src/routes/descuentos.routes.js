import { Router } from "express";
import {
  getDescuentos,
  createDescuentos,
  updateDescuentos,
  deleteDescuentos,
} from "../controllers/descuentos.controller.js";

const router = Router();

router.get("/", getDescuentos);
router.post("/", createDescuentos);
router.put("/:id",updateDescuentos);
router.delete("/:id",deleteDescuentos);

export default router;
