import { pool } from "../db.js";
import { DateTime } from "luxon";

export const getBitacora = async (req, res) => {
  try {
    const { nombre, fecha_entrada, estado } = req.query;

    let condiciones = [];
    let valores = [];
    let i = 1;

    if (nombre) {
      condiciones.push(`LOWER(u.nombre) LIKE LOWER($${i++})`);
      valores.push(`%${nombre}%`);
    }

    if (fecha_entrada) {
      condiciones.push(`b.fecha_entrada = $${i++}`);
      valores.push(fecha_entrada);
    }

    if (estado) {
      condiciones.push(`b.estado = $${i++}`);
      valores.push(estado);
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";

    const result = await pool.query(
      `
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
      ${whereClause}
      ORDER BY b.fecha_entrada DESC, b.hora_entrada DESC
      `,
      valores
    );

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

  // Solución manual: obtener fecha y hora en Bolivia desde UTC - 4
  const boliviaNow = DateTime.utc().minus({ hours: 4 });
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
      hora: horaEntrada,
    });
  } catch (error) {
    console.error("Error al registrar entrada:", error);
    res.status(500).json({ error: "Error al registrar entrada" });
  }
};
