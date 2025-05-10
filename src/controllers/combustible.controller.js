import { pool } from "../db.js";

export const getCombustibles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM combustible");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener combustibles");
  }
};

export const createCombustible = async (req, res) => {
  const { tipo, octanaje, nombre, esta_activo } = req.body;
  try {
    await pool.query(
      "INSERT INTO combustible (tipo, octanaje, nombre, esta_activo) VALUES ($1, $2, $3, $4)",
      [tipo, octanaje, nombre, esta_activo]
    );
    res.status(201).send("Combustible creado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear combustible");
  }
};

export const updateCombustible = async (req, res) => {
  const { id } = req.params;
  const { tipo, octanaje, nombre, esta_activo } = req.body;
  try {
    await pool.query(
      "UPDATE combustible SET tipo = $1, octanaje = $2, nombre = $3, esta_activo = $4 WHERE id = $5",
      [tipo, octanaje, nombre, esta_activo, id]
    );
    res.send("Combustible actualizado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar combustible");
  }
};
export const deleteCombustible = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM combustible WHERE id = $1", [id]);
    res.send("Combustible eliminado");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar combustible");
  }
};
