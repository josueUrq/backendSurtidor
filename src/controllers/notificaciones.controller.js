import { pool } from "../db.js";

// Obtener todas las notificaciones de un usuario
export const getNotificacionesUsuario = async (req, res) => {
  const { id_usuario } = req.params;
  const { visto } = req.query;

  try {
    let query = `
      SELECT 
        un.id,
        un.visto,
        un.recordar,
        un.fecha,
        np.titulo,
        np.descripcion,
        np.fecha AS fecha_notificacion,
        p.nombre AS producto_nombre,
        t.nombre AS tanque_nombre,
        s.nombre AS sucursal_nombre
      FROM usuario_notificacion un
      JOIN notificacion_producto np ON un.id_notificacion_producto = np.id
      LEFT JOIN producto p ON np.id_producto = p.id
      LEFT JOIN tanque t ON np.id_tanque = t.id
      LEFT JOIN sucursal s ON t.id_sucursal = s.id
      WHERE un.id_usuario = $1
    `;

    const params = [id_usuario];
    let index = 2;

    if (visto !== undefined) {
      query += ` AND un.visto = $${index++}`;
      params.push(visto === 'true');
    }

    query += ` ORDER BY np.fecha DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ error: "Error al obtener notificaciones" });
  }
};

// Contar notificaciones no leídas
export const contarNotificacionesNoLeidas = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM usuario_notificacion
       WHERE id_usuario = $1 AND visto = false`,
      [id_usuario]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("Error al contar notificaciones:", error);
    res.status(500).json({ error: "Error al contar notificaciones" });
  }
};

// Marcar notificación como leída
export const marcarComoLeida = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE usuario_notificacion 
       SET visto = true 
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    res.status(500).json({ error: "Error al marcar notificación" });
  }
};

// Marcar todas las notificaciones como leídas
export const marcarTodasComoLeidas = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    await pool.query(
      `UPDATE usuario_notificacion 
       SET visto = true 
       WHERE id_usuario = $1`,
      [id_usuario]
    );

    res.json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("Error al marcar todas las notificaciones:", error);
    res.status(500).json({ error: "Error al marcar todas las notificaciones" });
  }
};

// Crear notificación de stock bajo
export const crearNotificacionStockBajo = async (req, res) => {
  const { id_producto, id_tanque, stock_actual, stock_minimo } = req.body;

  try {
    // Obtener información del tanque y producto
    const tanqueInfo = await pool.query(
      `SELECT t.nombre as tanque_nombre, t.id_sucursal, p.nombre as producto_nombre
       FROM tanque t
       LEFT JOIN producto p ON $1 = p.id
       WHERE t.id = $2`,
      [id_producto, id_tanque]
    );

    if (tanqueInfo.rows.length === 0) {
      return res.status(404).json({ error: "Tanque no encontrado" });
    }

    const { tanque_nombre, id_sucursal, producto_nombre } = tanqueInfo.rows[0];

    // Crear notificación
    const notificacionResult = await pool.query(
      `INSERT INTO notificacion_producto (titulo, descripcion, hora, id_producto, id_tanque)
       VALUES ($1, $2, CURRENT_TIME, $3, $4)
       RETURNING *`,
      [
        "⚠️ Stock Bajo de Combustible",
        `El tanque "${tanque_nombre}" tiene stock crítico: ${stock_actual}m³ (mínimo: ${stock_minimo}m³). Se requiere reabastecimiento urgente.`,
        id_producto,
        id_tanque
      ]
    );

    const notificacionId = notificacionResult.rows[0].id;

    // Obtener usuarios administradores y supervisores de la sucursal
    const usuarios = await pool.query(
      `SELECT u.id 
       FROM usuario u
       JOIN rol r ON u.id_rol = r.id
       WHERE (r.nombre = 'administrador' OR r.nombre = 'supervisor')
       AND (u.id_sucursal = $1 OR u.id_sucursal IS NULL)`,
      [id_sucursal]
    );

    // Crear notificación para cada usuario
    for (const usuario of usuarios.rows) {
      await pool.query(
        `INSERT INTO usuario_notificacion (visto, recordar, id_notificacion_producto, id_usuario)
         VALUES (false, true, $1, $2)`,
        [notificacionId, usuario.id]
      );
    }

    res.status(201).json({
      message: "Notificación de stock bajo creada",
      notificacion: notificacionResult.rows[0],
      usuarios_notificados: usuarios.rows.length
    });

  } catch (error) {
    console.error("Error al crear notificación:", error);
    res.status(500).json({ error: "Error al crear notificación" });
  }
};

// Verificar stocks bajos automáticamente
export const verificarStocksBajos = async (req, res) => {
  try {
    // Obtener tanques con stock bajo (menos del 20% de capacidad)
    const tanquesStockBajo = await pool.query(`
      SELECT 
        t.id as tanque_id,
        t.nombre as tanque_nombre,
        t.stock,
        t.capacidad_max,
        t.id_sucursal,
        (t.stock::float / t.capacidad_max::float * 100) as porcentaje_stock,
        s.nombre as sucursal_nombre
      FROM tanque t
      JOIN sucursal s ON t.id_sucursal = s.id
      WHERE t.esta_activo = true 
      AND (t.stock::float / t.capacidad_max::float * 100) < 20
      ORDER BY porcentaje_stock ASC
    `);

    const alertasCreadas = [];

    for (const tanque of tanquesStockBajo.rows) {
      // Verificar si ya existe una notificación reciente (últimas 24 horas)
      const notificacionExistente = await pool.query(
        `SELECT COUNT(*) as count
         FROM notificacion_producto
         WHERE id_tanque = $1 
         AND fecha > NOW() - INTERVAL '24 hours'`,
        [tanque.tanque_id]
      );

      if (parseInt(notificacionExistente.rows[0].count) === 0) {
        // Crear nueva notificación
        const notificacionResult = await pool.query(
          `INSERT INTO notificacion_producto (titulo, descripcion, hora, id_producto, id_tanque)
           VALUES ($1, $2, CURRENT_TIME, $3, $4)
           RETURNING *`,
          [
            "⚠️ Stock Crítico de Combustible",
            `El tanque "${tanque.tanque_nombre}" en ${tanque.sucursal_nombre} tiene stock crítico: ${tanque.stock}m³ (${Math.round(tanque.porcentaje_stock)}% de capacidad). Se requiere reabastecimiento urgente.`,
            null, // id_producto puede ser null para notificaciones de tanque
            tanque.tanque_id
          ]
        );

        // Notificar a usuarios relevantes
        const usuarios = await pool.query(
          `SELECT u.id 
           FROM usuario u
           JOIN rol r ON u.id_rol = r.id
           WHERE (r.nombre = 'administrador' OR r.nombre = 'supervisor')
           AND (u.id_sucursal = $1 OR u.id_sucursal IS NULL)`,
          [tanque.id_sucursal]
        );

        for (const usuario of usuarios.rows) {
          await pool.query(
            `INSERT INTO usuario_notificacion (visto, recordar, id_notificacion_producto, id_usuario)
             VALUES (false, true, $1, $2)`,
            [notificacionResult.rows[0].id, usuario.id]
          );
        }

        alertasCreadas.push({
          tanque: tanque.tanque_nombre,
          sucursal: tanque.sucursal_nombre,
          stock: tanque.stock,
          porcentaje: Math.round(tanque.porcentaje_stock),
          usuarios_notificados: usuarios.rows.length
        });
      }
    }

    res.json({
      message: `Verificación completada. ${alertasCreadas.length} nuevas alertas creadas.`,
      tanques_criticos: tanquesStockBajo.rows.length,
      alertas_creadas: alertasCreadas
    });

  } catch (error) {
    console.error("Error al verificar stocks bajos:", error);
    res.status(500).json({ error: "Error al verificar stocks bajos" });
  }
};

// Eliminar notificación
export const eliminarNotificacion = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM usuario_notificacion WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    res.status(500).json({ error: "Error al eliminar notificación" });
  }
};

// Agrega esta función a tu notificaciones.controller.js

// Función simple para obtener todas las notificaciones directamente
export const getNotificacionesSimple = async (req, res) => {
  const { id_usuario } = req.params;
  
  try {
    console.log(`📄 Obteniendo notificaciones simples para usuario: ${id_usuario}`);
    
    // Primero, asegurémonos de que las notificaciones estén vinculadas al usuario
    // Si no existen en usuario_notificacion, las creamos automáticamente
    const vincularNotificaciones = await pool.query(`
      INSERT INTO usuario_notificacion (visto, recordar, id_notificacion_producto, id_usuario)
      SELECT false, true, np.id, $1
      FROM notificacion_producto np
      WHERE np.id NOT IN (
        SELECT un.id_notificacion_producto 
        FROM usuario_notificacion un 
        WHERE un.id_usuario = $1
      )
      RETURNING id
    `, [id_usuario]);
    
    console.log(`🔗 Vinculadas ${vincularNotificaciones.rows.length} notificaciones nuevas al usuario`);
    
    // Ahora obtener todas las notificaciones del usuario
    const result = await pool.query(`
      SELECT 
        un.id,
        un.visto,
        np.titulo,
        np.descripcion,
        np.fecha as fecha_notificacion,
        np.hora,
        t.nombre as tanque_nombre
      FROM usuario_notificacion un
      JOIN notificacion_producto np ON un.id_notificacion_producto = np.id
      LEFT JOIN tanque t ON np.id_tanque = t.id
      WHERE un.id_usuario = $1
      ORDER BY np.fecha DESC, np.hora DESC
    `, [id_usuario]);
    
    console.log(`✅ Encontradas ${result.rows.length} notificaciones para el usuario`);
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones simples:", error);
    res.status(500).json({ error: error.message });
  }
};

// Función para asegurar que todas las notificaciones están vinculadas a usuarios admin/supervisor
export const vincularNotificacionesExistentes = async (req, res) => {
  try {
    console.log("🔗 Vinculando notificaciones existentes a usuarios...");
    
    // Obtener todos los usuarios administradores y supervisores
    const usuarios = await pool.query(`
      SELECT u.id, u.nombre, r.nombre as rol
      FROM usuario u
      JOIN rol r ON u.id_rol = r.id
      WHERE r.nombre IN ('administrador', 'supervisor')
    `);
    
    console.log(`👥 Encontrados ${usuarios.rows.length} usuarios admin/supervisor`);
    
    let totalVinculadas = 0;
    
    // Para cada usuario, vincular todas las notificaciones que no tenga
    for (const usuario of usuarios.rows) {
      const vinculadas = await pool.query(`
        INSERT INTO usuario_notificacion (visto, recordar, id_notificacion_producto, id_usuario)
        SELECT false, true, np.id, $1
        FROM notificacion_producto np
        WHERE np.id NOT IN (
          SELECT un.id_notificacion_producto 
          FROM usuario_notificacion un 
          WHERE un.id_usuario = $1
        )
        RETURNING id
      `, [usuario.id]);
      
      totalVinculadas += vinculadas.rows.length;
      console.log(`✅ Usuario ${usuario.nombre}: ${vinculadas.rows.length} notificaciones vinculadas`);
    }
    
    res.json({
      message: `Proceso completado. ${totalVinculadas} notificaciones vinculadas en total.`,
      usuarios_procesados: usuarios.rows.length,
      notificaciones_vinculadas: totalVinculadas
    });
    
  } catch (error) {
    console.error("❌ Error vinculando notificaciones:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener estadísticas de notificaciones
export const getEstadisticasNotificaciones = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_notificaciones,
        COUNT(CASE WHEN un.visto = false THEN 1 END) as no_leidas,
        COUNT(CASE WHEN un.visto = true THEN 1 END) as leidas,
        COUNT(CASE WHEN np.titulo ILIKE '%stock%' THEN 1 END) as alertas_stock
      FROM usuario_notificacion un
      JOIN notificacion_producto np ON un.id_notificacion_producto = np.id
      WHERE np.fecha >= CURRENT_DATE - INTERVAL '30 days'
    `);

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
};