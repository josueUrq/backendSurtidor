import express from "express";
import { 
    getCombustibles,
    createCombustible,
    updateCombustible,
    deleteCombustible
 } from "../controllers/combustible.controller.js";

const router = express.Router();

//obtener combusstibles
router.get("/", getCombustibles);
// Crear nuevo combustible
router.post("/", createCombustible);
// Actualizar un combustible
router.put("/:id",updateCombustible );
// Eliminar un combustible
router.delete("/:id",deleteCombustible );

export default router;
