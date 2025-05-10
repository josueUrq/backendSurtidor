import { Router } from "express";
import {
  createProducto,
  updateProducto,
  deleteProducto,
} from "../controllers/productos.controller.js";
import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    // Evitar nombres duplicados
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

const router = Router();

router.post("/subir-imagen", upload.single("imagen"), (req, res) => {
  res.json({ nombreArchivo: req.file.filename });
});
//todos son api/productos desde el index
router.post("/",upload.single("url_image"), createProducto);
router.put("/:id",upload.single("url_image"), updateProducto);
router.delete("/:id", deleteProducto);

export default router;
