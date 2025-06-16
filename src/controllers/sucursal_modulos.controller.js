import { pool } from "../db.js";

// Obtener todos los módulos
export const getAllModulos = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre, descripcion FROM modulos ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener todos los módulos:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener módulos" });
  }
};

// Obtener módulos asignados a una sucursal
export const getModulosDeSucursal = async (req, res) => {
  const { id_sucursal } = req.params; // Cambiado a id_sucursal para mayor claridad
  try {
    const result = await pool.query(
      `SELECT m.id, m.nombre, m.descripcion
       FROM sucursal_modulos sm
       JOIN modulos m ON sm.id_modulo = m.id
       WHERE sm.id_sucursal = $1
       ORDER BY m.nombre ASC`,
      [id_sucursal]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener módulos de la sucursal:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener módulos de la sucursal" });
  }
};

// Añadir un módulo a una sucursal
export const addModuloASucursal = async (req, res) => {
  const { id_sucursal } = req.params; // Cambiado a id_sucursal
  const { id_modulo } = req.body;
  try {
    // Opcional: Verificar si ya existe para evitar duplicados
    const existing = await pool.query(
      "SELECT 1 FROM sucursal_modulos WHERE id_sucursal = $1 AND id_modulo = $2",
      [id_sucursal, id_modulo]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "El módulo ya está asignado a esta sucursal" });
    }

    await pool.query(
      `INSERT INTO sucursal_modulos (id_sucursal, id_modulo) VALUES ($1, $2) RETURNING id_sucursal, id_modulo`,
      [id_sucursal, id_modulo]
    );
    res.status(201).json({ message: "Módulo añadido a la sucursal con éxito" });
  } catch (error) {
    console.error("Error al añadir módulo a la sucursal:", error);
    res.status(500).json({ message: "Error interno del servidor al añadir módulo a la sucursal" });
  }
};

// Quitar un módulo de una sucursal
export const removeModuloDeSucursal = async (req, res) => {
  const { id_sucursal, id_modulo } = req.params; // Cambiado a id_sucursal, id_modulo
  try {
    const result = await pool.query(
      `DELETE FROM sucursal_modulos WHERE id_sucursal = $1 AND id_modulo = $2 RETURNING *`,
      [id_sucursal, id_modulo]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Módulo no encontrado para esta sucursal" });
    }
    res.json({ message: "Módulo eliminado de la sucursal con éxito" });
  } catch (error) {
    console.error("Error al eliminar módulo de la sucursal:", error);
    res.status(500).json({ message: "Error interno del servidor al eliminar módulo de la sucursal" });
  }
}; 