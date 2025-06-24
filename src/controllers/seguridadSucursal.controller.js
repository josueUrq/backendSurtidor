import { pool } from "../db.js";

// ID fija para Octano Pautiro
const SUCURSAL_ID = "3202fa9c-e1b1-4e64-a1b6-0bdab6efc67b";

// Mostrar todos los registros de esa sucursal
export const getSeguridadSucursal = async (req, res) => {
  const { estado, fecha } = req.query;

  let query = `
    SELECT * FROM seguridad_sucursal
    WHERE sucursal_id = $1
  `;
  const valores = [SUCURSAL_ID];
  let index = 2;

  if (estado) {
    query += ` AND estado ILIKE $${index}`;
    valores.push(estado);
    index++;
  }

  if (fecha) {
    query += ` AND fecha::date = $${index}`;
    valores.push(fecha);
    index++;
  }

  query += ` ORDER BY fecha DESC`;

  try {
    const result = await pool.query(query, valores);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener datos de seguridad");
  }
};


// Crear nuevo registro
export const createSeguridadSucursal = async (req, res) => {
  const { tipo, descripcion, estado, fecha, observaciones } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO seguridad_sucursal 
        (sucursal_id, tipo, descripcion, estado, fecha, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [SUCURSAL_ID, tipo, descripcion, estado, fecha, observaciones]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear registro");
  }
};

// Actualizar un registro
export const updateSeguridadSucursal = async (req, res) => {
  const { id } = req.params;
  const { tipo, descripcion, estado, fecha, observaciones } = req.body;
  try {
    const result = await pool.query(
      `UPDATE seguridad_sucursal 
       SET tipo = $1, descripcion = $2, estado = $3, fecha = $4, observaciones = $5
       WHERE id = $6 AND sucursal_id = $7
       RETURNING *`,
      [tipo, descripcion, estado, fecha, observaciones, id, SUCURSAL_ID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar registro");
  }
};

// Eliminar un registro
export const deleteSeguridadSucursal = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM seguridad_sucursal WHERE id = $1 AND sucursal_id = $2 RETURNING *`,
      [id, SUCURSAL_ID]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }
    res.json({ message: "Registro eliminado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar registro");
  }
};
