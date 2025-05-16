import { pool } from "../db.js";

export const getCombustibles = async (req, res) => {
  try {
    // Verificar si la tabla combustible existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'combustible'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      return res.status(404).json({ message: "Tabla combustible no encontrada" });
    }
    
    // Verificar la estructura de la tabla para determinar si está_activo es una columna
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'combustible' 
        AND column_name = 'esta_activo'
      );
    `);
    
    let query = "SELECT * FROM combustible";
    
    // Si existe la columna esta_activo, filtrar por ella
    if (columnCheck.rows[0].exists) {
      query += " WHERE esta_activo = true";
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener combustibles:", err);
    res.status(500).json({ message: "Error al obtener combustibles", error: err.message });
  }
};

export const getAllCombustibles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM combustible");
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener todos los combustibles:", err);
    res.status(500).json({ message: "Error al obtener todos los combustibles", error: err.message });
  }
};

export const getCombustible = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM combustible WHERE id = $1", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Combustible no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener combustible");
  }
};

export const createCombustible = async (req, res) => {
  const { tipo, octanaje, nombre, esta_activo, id_producto } = req.body;
  try {
    // Verificar si id_producto es una columna en la tabla
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'combustible' 
        AND column_name = 'id_producto'
      );
    `);
    
    let query;
    let values;
    
    if (columnCheck.rows[0].exists) {
      query = "INSERT INTO combustible (tipo, octanaje, nombre, esta_activo, id_producto) VALUES ($1, $2, $3, $4, $5) RETURNING *";
      values = [tipo, octanaje, nombre, esta_activo, id_producto];
    } else {
      query = "INSERT INTO combustible (tipo, octanaje, nombre, esta_activo) VALUES ($1, $2, $3, $4) RETURNING *";
      values = [tipo, octanaje, nombre, esta_activo];
    }
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al crear combustible");
  }
};

export const updateCombustible = async (req, res) => {
  const { id } = req.params;
  const { tipo, octanaje, nombre, esta_activo, id_producto } = req.body;
  try {
    // Verificar si id_producto es una columna en la tabla
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'combustible' 
        AND column_name = 'id_producto'
      );
    `);
    
    let query;
    let values;
    
    if (columnCheck.rows[0].exists) {
      query = "UPDATE combustible SET tipo = $1, octanaje = $2, nombre = $3, esta_activo = $4, id_producto = $5 WHERE id = $6 RETURNING *";
      values = [tipo, octanaje, nombre, esta_activo, id_producto, id];
    } else {
      query = "UPDATE combustible SET tipo = $1, octanaje = $2, nombre = $3, esta_activo = $4 WHERE id = $5 RETURNING *";
      values = [tipo, octanaje, nombre, esta_activo, id];
    }
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Combustible no encontrado" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al actualizar combustible");
  }
};

export const deleteCombustible = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el combustible está asociado a algún tanque
    const tanquesAsociados = await pool.query(
      "SELECT COUNT(*) FROM tanque WHERE id_combustible = $1",
      [id]
    );
    
    if (parseInt(tanquesAsociados.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: "No se puede eliminar este combustible porque está asociado a uno o más tanques"
      });
    }
    
    const result = await pool.query("DELETE FROM combustible WHERE id = $1", [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Combustible no encontrado" });
    }
    
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar combustible");
  }
};

// Obtener combustibles con sus productos relacionados
export const getCombustiblesConProductos = async (req, res) => {
  try {
    // Verificar si id_producto es una columna en la tabla
    const columnCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'combustible' 
        AND column_name = 'id_producto'
      );
    `);
    
    let query;
    
    if (columnCheck.rows[0].exists) {
      query = `
        SELECT c.*, p.nombre AS nombre_producto, p.precio_venta, p.stock
        FROM combustible c
        LEFT JOIN producto p ON c.id_producto = p.id
      `;
    } else {
      query = "SELECT * FROM combustible";
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al obtener combustibles con productos");
  }
};