import { pool } from "../db.js";

// Listar todos los mantenimientos
export const getAllMantenimientos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dm.*, d.ubicacion as dispensador, tm.nombre as tipo_mantenimiento
      FROM dispensador_mantenimiento dm
      JOIN dispensador d ON dm.dispensador_id = d.id
      JOIN tipo_mantenimiento tm ON dm.tipo_mantenimiento_id = tm.id
      ORDER BY dm.fecha DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener mantenimientos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Crear mantenimiento
export const createMantenimiento = async (req, res) => {
  const { dispensador_id, tipo_mantenimiento_id, fecha, estado, observaciones } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO dispensador_mantenimiento (dispensador_id, tipo_mantenimiento_id, fecha, estado, observaciones)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [dispensador_id, tipo_mantenimiento_id, fecha, estado, observaciones]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear mantenimiento:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Editar mantenimiento
export const updateMantenimiento = async (req, res) => {
  const { id } = req.params;
  const { dispensador_id, tipo_mantenimiento_id, fecha, estado, observaciones } = req.body;
  try {
    const result = await pool.query(
      `UPDATE dispensador_mantenimiento SET dispensador_id=$1, tipo_mantenimiento_id=$2, fecha=$3, estado=$4, observaciones=$5 WHERE id=$6 RETURNING *`,
      [dispensador_id, tipo_mantenimiento_id, fecha, estado, observaciones, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "No encontrado" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar mantenimiento:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Eliminar mantenimiento
export const deleteMantenimiento = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM dispensador_mantenimiento WHERE id=$1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "No encontrado" });
    res.json({ message: "Eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar mantenimiento:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los tipos de mantenimiento
export const getTiposMantenimiento = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, nombre FROM tipo_mantenimiento ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener tipos de mantenimiento:", error);
    res.status(500).json({ message: "Error interno del servidor al obtener tipos de mantenimiento" });
  }
}; 