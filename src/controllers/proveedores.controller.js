import {pool} from "../db.js";

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM proveedor ORDER BY nombre");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener proveedores" });
    }
  };
  
  // Crear un nuevo proveedor
export const createProveedor = async (req, res) => {
    const { nombre, telefono, correo, direccion, nit, detalle } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO proveedor (nombre, telefono, correo, direccion, nit, detalle)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [nombre, telefono, correo, direccion, nit, detalle]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al crear proveedor" });
    }
  };
  
  // Actualizar proveedor por ID
 export const updateProveedor = async (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, correo, direccion, nit, detalle } = req.body;
    try {
      const result = await pool.query(
        `UPDATE proveedor 
         SET nombre = $1, telefono = $2, correo = $3, direccion = $4, nit = $5, detalle = $6
         WHERE id = $7 RETURNING *`,
        [nombre, telefono, correo, direccion, nit, detalle, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al actualizar proveedor" });
    }
  };
  
  // Eliminar proveedor por ID
  export const delateProveedor = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM proveedor WHERE id = $1", [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }
      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al eliminar proveedor" });
    }
  };