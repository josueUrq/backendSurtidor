import { pool } from "../db.js";
import { DateTime } from "luxon";

export const getBitacora = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id,
        u.nombre AS nombre_usuario,
        b.ip,
        b.fecha_entrada,
        b.hora_entrada,
        b.acciones,
        b.estado
      FROM bitacora b
      JOIN usuario u ON b.usuario_id = u.id
      ORDER BY b.fecha_entrada, b.hora_entrada DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener la bitácora:", error);
    res.status(500).json({ error: "Error al obtener la bitácora" });
  }
};

export const registrarEntrada = async (req, res) => {
  const { usuarioId, acciones, estado } = req.body;

  // Obtener IP
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    (req.connection?.socket ? req.connection.socket.remoteAddress : null);

  // Obtener fecha y hora exactas de Bolivia
  const boliviaNow = DateTime.now().setZone("America/La_Paz");
  const fechaEntrada = boliviaNow.toFormat("yyyy-MM-dd");
  const horaEntrada = boliviaNow.toFormat("HH:mm:ss");

  try {
    await pool.query(
      `
      INSERT INTO bitacora (usuario_id, ip, fecha_entrada, hora_entrada, acciones, estado)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, fecha_entrada, hora_entrada
    `,
      [usuarioId, ip, fechaEntrada, horaEntrada, acciones, estado]
    );

    res.json({
      success: true,
      fecha: fechaEntrada,
      hora: horaEntrada
    });
  } catch (error) {
    console.error("Error al registrar entrada:", error);
    res.status(500).json({ error: "Error al registrar entrada" });
  }
};
