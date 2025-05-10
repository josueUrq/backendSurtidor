import { pool } from "../db.js";

// Obtener todos los permisos
export const getManguerasDeDispensador = async (req, res) => {
  const { dispensadorId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM manguera WHERE id_dispensador=$1",
      [dispensadorId]
    );
    res.json(result.rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener mangueras del dispensador" });
  }
};
export const createMangueraDeSucursal = async (req, res) => {
  const { esta_activo, id_dispensador } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO manguera (esta_activo, id_dispensador)
       VALUES ($1, $2)
       RETURNING *`,
      [esta_activo, id_dispensador]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al crear dispensador" });
  }
};
// Actualizar un dispensador
export const updateDispensadoresDeSucursal = async (req, res) => {
  const { mangueraId } = req.params;
  const { esta_activo, id_dispensador } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE manguera
       SET esta_activo = $1,
           id_dispensador = $2
       WHERE id = $3
       RETURNING *`,
      [esta_activo, id_dispensador, mangueraId]
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
export const deletemangueraDeSucursal = async (req, res) => {
  const { mangueraId } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM manguera WHERE id = $1",
      [mangueraId]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Dispensador no encontrado" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Error al obtener dispensadores" });
  }
};
