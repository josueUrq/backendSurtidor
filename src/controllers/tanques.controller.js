import { pool } from '../db.js';

// Obtener todos los tanques
export const getTanques = async (req, res) => {
  try {
    const { id_sucursal } = req.query;
    
    if (!id_sucursal) {
      return res.status(400).json({ message: 'Se requiere el ID de la sucursal' });
    }

    const result = await pool.query('SELECT * FROM tanque WHERE id_sucursal = $1', [id_sucursal]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener los tanques:', error);
    res.status(500).json({ message: 'Error al obtener los tanques' });
  }
};

// Crear un nuevo tanque
export const createTanque = async (req, res) => {
  const { nombre, descripcion, capacidad_max, stock, esta_activo, fecha_instalacion, ultima_revision, id_sucursal } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tanque (nombre, descripcion, capacidad_max, stock, esta_activo, fecha_instalacion, ultima_revision, id_sucursal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [nombre, descripcion, capacidad_max, stock, esta_activo, fecha_instalacion, ultima_revision, id_sucursal]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el tanque' });
  }
};

// Actualizar un tanque
export const updateTanque = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, capacidad_max, stock, esta_activo, fecha_instalacion, ultima_revision, id_sucursal } = req.body;
  try {
    await pool.query(
      'UPDATE tanque SET nombre=$1, descripcion=$2, capacidad_max=$3, stock=$4, esta_activo=$5, fecha_instalacion=$6, ultima_revision=$7, id_sucursal=$8 WHERE id=$9',
      [nombre, descripcion, capacidad_max, stock, esta_activo, fecha_instalacion, ultima_revision, id_sucursal, id]
    );
    res.json({ message: 'Tanque actualizado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el tanque' });
  }
};

// Eliminar un tanque
export const deleteTanque = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tanque WHERE id=$1', [id]);
    res.json({ message: 'Tanque eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el tanque' });
  }
}; 