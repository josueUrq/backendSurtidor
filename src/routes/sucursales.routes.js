import { Router } from "esxpress";
import {
    getSucursales,
    gestAllSucursales,
    getSucursal,
    createSucursal,
    updateSucursal,
    deleteSucursal,
    getSucursalesConProductos
} from "../controllers/sucursal.controller.js";

const router = Router();

//Rutas para sucursales
router.get("/", getSucursales);
router.get("/all", getAllSucursales);
router.get("/with-productos", getSucursalesConProductos);
router.get("/:id", getSucursal);
router.post("/", createSucursal);
router.put("/:id", updateSucursal);
router.delete("/:id", deleteSucursal);

export default router;