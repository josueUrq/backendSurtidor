import express from "express";
import { registrarEntrada,getBitacora } from "../controllers/bitacora.controller.js";

const router = express.Router();

router.get('/',getBitacora); 
router.post('/entrada', registrarEntrada);

export default router;