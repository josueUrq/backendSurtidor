import { pool } from "../db.js";

// Obtener todos los descuentos
export const getDescuentos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM descuento");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener descuentos" });
  }
};

// Crear nuevo descuento
export const createDescuentos = async (req, res) => {
  const { nombre, descripcion, porcentaje, esta_activo } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO descuento (nombre, descripcion, porcentaje, esta_activo)
         VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, descripcion, porcentaje, esta_activo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al crear descuento" });
  }
};

// Actualizar un descuento
export const updateDescuentos = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, porcentaje, esta_activo } = req.body;
  try {
    await pool.query(
      `UPDATE descuento SET nombre=$1, descripcion=$2, porcentaje=$3, esta_activo=$4 WHERE id=$5`,
      [nombre, descripcion, porcentaje, esta_activo, id]
    );
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar descuento" });
  }
};

// Eliminar un descuento
export const deleteDescuentos = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`DELETE FROM descuento WHERE id=$1`, [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar descuento" });
  }
};
