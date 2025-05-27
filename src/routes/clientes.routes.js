import { Router } from "express";
import {
  buscarClientePorPlaca,
  registrarCliente,
} from "../controllers/clientes.controller.js";

const router = Router();

router.get("/clientes/:placa", buscarClientePorPlaca);
router.post("/clientes", registrarCliente);

export default router;
