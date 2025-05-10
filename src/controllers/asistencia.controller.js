import { pool } from "../db.js";

// Marcar entrada
export const marcarEntrada = async (req, res) => {
  const { id_usuario } = req.body;
  await pool.query("SET TIME ZONE 'America/La_Paz'");
  try {
    // Verificar si ya existe un registro hoy
    const existe = await pool.query(
      "SELECT * FROM registro_asistencia WHERE id_usuario = $1 AND fecha = CURRENT_DATE",
      [id_usuario]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "Ya registraste entrada hoy." });
    }

    const resultado = await pool.query(
      `INSERT INTO registro_asistencia (id_usuario, hora_entrada)
       VALUES ($1, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id_usuario]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al registrar entrada:", error);
    res.status(500).json({ message: "Error al registrar entrada" });
  }
};

// Marcar salida
export const marcarSalida = async (req, res) => {
  const { id_usuario } = req.body;
  await pool.query("SET TIME ZONE 'America/La_Paz'");
  try {
    const registro = await pool.query(
      "SELECT * FROM registro_asistencia WHERE id_usuario = $1 AND fecha = CURRENT_DATE",
      [id_usuario]
    );

    if (registro.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No hay entrada registrada hoy." });
    }

    if (registro.rows[0].hora_salida) {
      return res.status(400).json({ message: "Ya registraste salida hoy." });
    }

    const resultado = await pool.query(
      `UPDATE registro_asistencia
       SET hora_salida = CURRENT_TIMESTAMP,
           tiempo_trabajado = CURRENT_TIMESTAMP - hora_entrada
       WHERE id_usuario = $1 AND fecha = CURRENT_DATE
       RETURNING *`,
      [id_usuario]
    );

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al registrar salida:", error);
    res.status(500).json({ message: "Error al registrar salida" });
  }
};

// Obtener el registro de hoy
export const obtenerRegistroHoy = async (req, res) => {
  const { id_usuario } = req.params;
  await pool.query("SET TIME ZONE 'America/La_Paz'");
  try {
    const result = await pool.query(
      `SELECT * FROM registro_asistencia
       WHERE id_usuario = $1 AND fecha = CURRENT_DATE`,
      [id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(404).json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener registro de hoy:", error);
    res.status(500).json({ message: "Error al obtener registro de hoy" });
  }
};

export const obtenerHistorialAsistencia = async (req, res) => {
  const { id_usuario } = req.params;
  await pool.query("SET TIME ZONE 'America/La_Paz'");
  try {
    const result = await pool.query(
      `SELECT 
        ra.fecha,
        ra.hora_entrada,
        ra.hora_salida,
        ra.tiempo_trabajado,
        u.nombre,
        u.correo
      FROM registro_asistencia ra
      JOIN usuario u ON ra.id_usuario = u.id
      WHERE ra.id_usuario = $1
      ORDER BY ra.fecha DESC`,
      [id_usuario]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener historial de asistencia:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};
export const obtenerTodasLasAsistencia = async (req, res) => {
  await pool.query("SET TIME ZONE 'America/La_Paz'");
  try {
    const result = await pool.query(
      `SELECT 
        ra.fecha,
        ra.hora_entrada,
        ra.hora_salida,
        ra.tiempo_trabajado,
        u.nombre,
        u.correo
      FROM registro_asistencia ra
      JOIN usuario u ON ra.id_usuario = u.id
      ORDER BY ra.fecha DESC`,
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener historial de asistencia:", error);
    res.status(500).json({ error: "Error al obtener historial" });
  }
};
