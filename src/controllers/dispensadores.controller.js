import { pool } from "../db.js";

// Obtener dispensadores de una sucursal
export const getDispensadoresDeSucursal = async (req, res) => {
  const { sucursalId } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM dispensador WHERE id_sucursal = $1",
      [sucursalId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener dispensadores" });
  }
};
// Obtener dispensadores de una sucursal Activos
export const getDispensadoresDeSucursalActivo = async (req, res) => {
  const { sucursalId } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM dispensador WHERE id_sucursal = $1 AND estado = 'Activo'",
      [sucursalId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al obtener dispensadores" });
  }
};

// Crear un dispensador para una sucursal
export const createDispensadoresDeSucursal = async (req, res) => {
  const { id_sucursal, ubicacion, estado, capacidad_maxima,id_tanque } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO dispensador (id_sucursal, ubicacion, estado, capacidad_maxima,id_tanque)
       VALUES ($1, $2, $3, $4,$5)
       RETURNING *`,
      [id_sucursal, ubicacion, estado, capacidad_maxima,id_tanque]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear dispensador" });
  }
};

// Actualizar un dispensador
export const updateDispensadoresDeSucursal = async (req, res) => {
  const { dispensadorId } = req.params;
  const { ubicacion, estado, capacidad_maxima,id_tanque } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE dispensador
       SET ubicacion = $1,
           estado = $2,
           capacidad_maxima = $3,
           id_tanque = $4
       WHERE id = $5
       RETURNING *`,
      [ubicacion, estado, capacidad_maxima,id_tanque, dispensadorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Dispensador no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar dispensador" });
  }
};

// Eliminar un dispensador
export const deleteDispensadoresDeSucursal = async (req, res) => {
  const { dispensadorId } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM dispensador WHERE id = $1",
      [dispensadorId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: "Dispensador no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al eliminar dispensador" });
  }
};
