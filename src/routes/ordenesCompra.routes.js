import { Router } from "express";
import {
  listarOrdenesCompra,
  agregarOrdenCompra,
  eliminarOrdenCompra ,
  actualizarEstadoOrdenCompra 
} from "../controllers/ordenesCompra.controller.js";

const router = Router();

router.get("/ordenes-compra", listarOrdenesCompra);
router.post("/ordenes-compra", agregarOrdenCompra);
router.delete("/ordenes-compra/:id", eliminarOrdenCompra);
router.put('/ordenes-compra/:id', actualizarEstadoOrdenCompra);

export default router;
