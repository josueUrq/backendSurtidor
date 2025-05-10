import express from "express";
import { enviarReset, cambiarContra,verificarToken} from "../controllers/auth.controller.js";


const router = express.Router();

router.post("/auth/enviar-reset", enviarReset);
router.post("/auth/cambiar-contra/:token", cambiarContra);
router.get("/verificar-token/:token", verificarToken);


export default router;