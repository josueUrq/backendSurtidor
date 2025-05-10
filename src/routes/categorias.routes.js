import { Router } from "express";
import {
  getCategorias,
  getProductosDeCategoria,
  createCategoria,
  deleteCategoria,
} from "../controllers/categorias.controller.js";

const router = Router();

router.get("/categorias", getCategorias);
router.get("/productos/categoria/:categoriaId", getProductosDeCategoria);
router.post("/categorias", createCategoria);
router.delete("/categorias/:id", deleteCategoria);

export default router;
