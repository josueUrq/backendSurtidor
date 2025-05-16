import { Router } from "express";
import { 
  getCombustibles, 
  getAllCombustibles,
  getCombustible,
  createCombustible, 
  updateCombustible, 
  deleteCombustible,
  getCombustiblesConProductos
} from "../controllers/combustible.controller.js";

const router = Router();

// Rutas para combustibles
router.get("/", getCombustibles);
router.get("/all", getAllCombustibles);
router.get("/with-products", getCombustiblesConProductos);
router.get("/:id", getCombustible);
router.post("/", createCombustible);
router.put("/:id", updateCombustible);
router.delete("/:id", deleteCombustible);

export default router;