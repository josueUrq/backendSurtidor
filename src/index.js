import express from "express";
import { PORT } from "./config.js";
import userRoutes from "./routes/users.routes.js";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import generalRoutes from "./routes/general.routes.js";
import rolRoutes from "./routes/rol.routes.js";
import asistenciasRoutes from "./routes/asistencia.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import combustibleRoutes from "./routes/combustible.routes.js";
import proveedoresRoutes from "./routes/proveedores.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import descuentosRoutes from "./routes/descuentos.routes.js";
import dispensadoresRoutes from "./routes/dispensadores.routes.js";
import mangueraRoutes from "./routes/mangueras.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { FRONTEND_URL } from "./config.js";
import tanquesRoutes from "./routes/tanques.routes.js";
import clienteRoutes from "./routes/clientes.routes.js";
import stripeRoutes from './routes/stripe.routes.js';
import ordenesCompraRoutes from "./routes/ordenesCompra.routes.js";
import bitacoraRoutes from "./routes/bitacora.routes.js";
import quejasRoutes from "./routes/quejas.routes.js"; // ← NUEVA LÍNEA

const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};

const app = express();

const __filename = fileURLToPath(import.meta.url);

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", true);

app.use("/api/uploads", express.static(path.resolve("uploads")));
app.use(morgan("dev"));
app.use(express.json());
app.use("/api", userRoutes);
app.use("/api", generalRoutes);
app.use("/api", rolRoutes);
app.use("/api/asistencia", asistenciasRoutes);
app.use("/api", categoriasRoutes);
app.use("/api", clienteRoutes);
app.use('/api/stripe', stripeRoutes);
app.use("/api", ordenesCompraRoutes);

app.use("/api/combustibles", combustibleRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/descuentos", descuentosRoutes);
app.use("/api/dispensadores", dispensadoresRoutes);
app.use("/api/mangueras", mangueraRoutes);
app.use("/api", authRoutes);
app.use("/api/tanques", tanquesRoutes);
app.use("/api/bitacora", bitacoraRoutes);
app.use("/api/quejas", quejasRoutes); // ← NUEVA LÍNEA

app.listen(PORT);
console.log("server on port ", PORT);