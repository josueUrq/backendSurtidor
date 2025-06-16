import { pool } from "../db.js";

// Obtener todas las quejas y sugerencias (para administradores)
export const getQuejasSugerencias = async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    
    let query = `
      SELECT 
        qs.*,
        s.nombre AS sucursal_nombre
      FROM quejas_sugerencias qs
      LEFT JOIN sucursal s ON qs.id_sucursal = s.id
      WHERE 1=1
    `;
    
    const params = [];
    let index = 1;

    if (tipo) {
      query += ` AND qs.tipo = $${index++}`;
      params.push(tipo);
    }
    
    if (estado) {
      query += ` AND qs.estado = $${index++}`;
      params.push(estado);
    }

    query += ` ORDER BY qs.fecha_creacion DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener quejas y sugerencias:", error);
    res.status(500).json({ error: "Error al obtener quejas y sugerencias" });
  }
};

// Crear nueva queja o sugerencia (público)
export const crearQuejaSugerencia = async (req, res) => {
  try {
    const { nombre, correo, telefono, tipo, asunto, descripcion, id_sucursal } = req.body;

    // Validaciones básicas
    if (!nombre || !correo || !tipo || !asunto || !descripcion) {
      return res.status(400).json({ 
        error: "Faltan campos obligatorios: nombre, correo, tipo, asunto y descripción" 
      });
    }

    if (!['queja', 'sugerencia'].includes(tipo)) {
      return res.status(400).json({ 
        error: "El tipo debe ser 'queja' o 'sugerencia'" 
      });
    }

    const result = await pool.query(
      `INSERT INTO quejas_sugerencias (nombre, correo, telefono, tipo, asunto, descripcion, id_sucursal)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, correo, telefono, tipo, asunto, descripcion, id_sucursal]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear queja/sugerencia:", error);
    res.status(500).json({ error: "Error al crear queja/sugerencia" });
  }
};

// Obtener una queja específica por ID
export const getQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        qs.*,
        s.nombre AS sucursal_nombre
       FROM quejas_sugerencias qs
       LEFT JOIN sucursal s ON qs.id_sucursal = s.id
       WHERE qs.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Queja/sugerencia no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener queja/sugerencia:", error);
    res.status(500).json({ error: "Error al obtener queja/sugerencia" });
  }
};

// Actualizar estado y respuesta de una queja (solo administradores)
export const actualizarQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    if (!['pendiente', 'en_revision', 'resuelto', 'cerrado'].includes(estado)) {
      return res.status(400).json({ 
        error: "Estado inválido. Debe ser: pendiente, en_revision, resuelto, cerrado" 
      });
    }

    const result = await pool.query(
      `UPDATE quejas_sugerencias 
       SET estado = $1, respuesta = $2, fecha_respuesta = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [estado, respuesta, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Queja/sugerencia no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar queja/sugerencia:", error);
    res.status(500).json({ error: "Error al actualizar queja/sugerencia" });
  }
};

// Eliminar queja/sugerencia (solo administradores)
export const eliminarQuejaSugerencia = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM quejas_sugerencias WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Queja/sugerencia no encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar queja/sugerencia:", error);
    res.status(500).json({ error: "Error al eliminar queja/sugerencia" });
  }
};

// Obtener estadísticas de quejas y sugerencias
export const getEstadisticasQuejas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN tipo = 'queja' THEN 1 END) as total_quejas,
        COUNT(CASE WHEN tipo = 'sugerencia' THEN 1 END) as total_sugerencias,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN estado = 'resuelto' THEN 1 END) as resueltos,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados
      FROM quejas_sugerencias
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};