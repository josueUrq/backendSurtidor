import { pool } from "../db.js";

// Obtener todos los permisos
export const getPermisos = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, descripcion FROM permiso"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener permisos" });
  }
};
