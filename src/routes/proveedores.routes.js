import { Router } from "express";
import { getProveedores,
         createProveedor,
         updateProveedor,
         delateProveedor
 } from "../controllers/proveedores.controller.js";


 const router = Router();

 router.get("/",getProveedores);
 router.post("/",createProveedor);
 router.put("/:id",updateProveedor);
 router.delete("/:id",delateProveedor);

 export default router;
