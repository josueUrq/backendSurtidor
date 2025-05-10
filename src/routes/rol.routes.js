import { Router } from "express";
import {
  getRoles,
  getPermisos,
  getPermisosPorRol,
  getPermisosPorUsuario,
  actualizarPermisosUsuario,
  actualizarRolUsuario,
} from "../controllers/rol.controller.js";

const router = Router();

// Obtener todos los roles
router.get("/roles", getRoles);

// Obtener todos los permisos
router.get("/permisos", getPermisos);

// Obtener permisos por rol
router.get("/roles/:id/permisos", getPermisosPorRol);

// Obtener permisos de un usuario por ID
router.get("/usuarios/permisos/:id", getPermisosPorUsuario);

// Actualizar permisos y rol de un usuario
router.put("/usuarios/permisos/:id", actualizarPermisosUsuario);

// Solo cambiar el rol del usuario
router.put("/usuarios/rol/:id", actualizarRolUsuario);

export default router;
