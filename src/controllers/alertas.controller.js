// alertas.controller.js - VERSIÓN CORREGIDA

import { pool } from "../db.js";

// Obtener todas las alertas de inventario con filtros
export const getAlertasInventario = async (req, res) => {
  try {
    console.log("🔍 Obteniendo alertas de inventario...");
    console.log("Query params:", req.query);
    
    const { sucursal_id, fecha_desde, fecha_hasta, nivel } = req.query;
    
    // Query simplificado que evita problemas con UUIDs
    let query = `
      SELECT 
        np.id,
        np.titulo,
        np.descripcion,
        np.fecha,
        np.hora,
        t.id as tanque_id,
        COALESCE(t.nombre, 'Sin tanque') as tanque_nombre,
        COALESCE(t.stock, 0) as stock_actual,
        COALESCE(t.capacidad_max, 1) as capacidad_max,
        CASE 
          WHEN t.capacidad_max > 0 THEN ROUND((COALESCE(t.stock, 0)::DECIMAL / t.capacidad_max::DECIMAL) * 100, 2)
          ELSE 0
        END as porcentaje_stock,
        COALESCE(s.nombre, 'Sin sucursal') as sucursal_nombre,
        s.id as sucursal_id,
        CASE 
          WHEN t.capacidad_max IS NULL OR t.capacidad_max = 0 THEN 'NORMAL'
          WHEN (COALESCE(t.stock, 0)::DECIMAL / t.capacidad_max::DECIMAL) * 100 < 10 THEN 'CRÍTICO'
          WHEN (COALESCE(t.stock, 0)::DECIMAL / t.capacidad_max::DECIMAL) * 100 < 20 THEN 'BAJO'
          ELSE 'NORMAL'
        END as nivel_alerta
      FROM notificacion_producto np
      LEFT JOIN tanque t ON np.id_tanque = t.id
      LEFT JOIN sucursal s ON t.id_sucursal = s.id
      WHERE np.id_tanque IS NOT NULL
    `;

    const params = [];
    let paramIndex = 1;

    // Filtros opcionales
    if (sucursal_id && sucursal_id !== 'undefined' && sucursal_id !== 'null') {
      query += ` AND s.id = $${paramIndex++}`;
      params.push(sucursal_id);
    }

    if (fecha_desde) {
      query += ` AND np.fecha >= $${paramIndex++}`;
      params.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND np.fecha <= $${paramIndex++}`;
      params.push(fecha_hasta);
    }

    // Filtro por nivel de alerta
    if (nivel) {
      query += ` AND CASE 
        WHEN t.capacidad_max IS NULL OR t.capacidad_max = 0 THEN 'NORMAL'
        WHEN (COALESCE(t.stock, 0)::DECIMAL / t.capacidad_max::DECIMAL) * 100 < 10 THEN 'CRÍTICO'
        WHEN (COALESCE(t.stock, 0)::DECIMAL / t.capacidad_max::DECIMAL) * 100 < 20 THEN 'BAJO'
        ELSE 'NORMAL'
      END = $${paramIndex++}`;
      params.push(nivel);
    }

    query += ` ORDER BY np.fecha DESC, porcentaje_stock ASC`;

    console.log("SQL Query:", query);
    console.log("Params:", params);

    const result = await pool.query(query, params);
    console.log("Resultados encontrados:", result.rows.length);
    
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener alertas de inventario:", error);
    res.status(500).json({ 
      error: "Error al obtener alertas de inventario",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Obtener estadísticas de alertas
export const getEstadisticasAlertas = async (req, res) => {
  try {
    console.log("📊 Obteniendo estadísticas de alertas...");
    
    const { sucursal_id } = req.query;
    
    // Estadísticas básicas
    let statsQuery = `
      SELECT 
        COUNT(np.*) as total_alertas,
        COUNT(CASE WHEN t.capacidad_max > 0 AND (t.stock::DECIMAL / t.capacidad_max::DECIMAL) * 100 < 10 THEN 1 END) as alertas_criticas,
        COUNT(CASE WHEN t.capacidad_max > 0 AND (t.stock::DECIMAL / t.capacidad_max::DECIMAL) * 100 BETWEEN 10 AND 20 THEN 1 END) as alertas_bajas,
        COUNT(CASE WHEN np.fecha >= CURRENT_DATE THEN 1 END) as alertas_hoy,
        COUNT(CASE WHEN np.fecha >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as alertas_semana,
        COALESCE(AVG(CASE WHEN t.capacidad_max > 0 THEN t.stock::DECIMAL / t.capacidad_max::DECIMAL * 100 END), 0) as promedio_stock_porcentaje
      FROM notificacion_producto np
      LEFT JOIN tanque t ON np.id_tanque = t.id
      LEFT JOIN sucursal s ON t.id_sucursal = s.id
      WHERE np.fecha >= CURRENT_DATE - INTERVAL '30 days'
      AND np.id_tanque IS NOT NULL
    `;

    const params = [];
    if (sucursal_id && sucursal_id !== 'undefined' && sucursal_id !== 'null') {
      statsQuery += ` AND s.id = $1`;
      params.push(sucursal_id);
    }

    const result = await pool.query(statsQuery, params);

    // Obtener tanques con stock más bajo
    let tanquesCriticosQuery = `
      SELECT 
        t.nombre as tanque_nombre,
        s.nombre as sucursal_nombre,
        t.stock,
        t.capacidad_max,
        CASE 
          WHEN t.capacidad_max > 0 THEN ROUND((t.stock::DECIMAL / t.capacidad_max::DECIMAL) * 100, 1)
          ELSE 0
        END as porcentaje_stock
      FROM tanque t
      LEFT JOIN sucursal s ON t.id_sucursal = s.id
      WHERE t.esta_activo = true
    `;

    if (sucursal_id && sucursal_id !== 'undefined' && sucursal_id !== 'null') {
      tanquesCriticosQuery += ` AND s.id = $1`;
    }

    tanquesCriticosQuery += ` ORDER BY (CASE WHEN t.capacidad_max > 0 THEN t.stock::DECIMAL / t.capacidad_max::DECIMAL ELSE 0 END) ASC LIMIT 5`;

    const tanquesCriticos = await pool.query(tanquesCriticosQuery, params);

    console.log("Estadísticas obtenidas:", result.rows[0]);
    console.log("Tanques críticos:", tanquesCriticos.rows.length);

    res.json({
      estadisticas: result.rows[0] || {
        total_alertas: 0,
        alertas_criticas: 0,
        alertas_bajas: 0,
        alertas_hoy: 0,
        alertas_semana: 0,
        promedio_stock_porcentaje: 0
      },
      tanques_criticos: tanquesCriticos.rows
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ 
      error: "Error al obtener estadísticas",
      details: error.message 
    });
  }
};

// Verificar manualmente todos los stocks
export const verificarStocksManual = async (req, res) => {
  try {
    console.log("🔍 Verificación manual de stocks iniciada...");
    
    const usuarioId = req.body.usuarioId || req.headers['user-id'];
    
    // Usar la función SQL que ya sabemos que funciona
    const resultado = await pool.query('SELECT * FROM verificar_todos_los_stocks()');
    
    // Registrar en bitácora si hay usuarioId
    if (usuarioId) {
      try {
        await pool.query(
          `INSERT INTO bitacora (usuario_id, ip, fecha_entrada, hora_entrada, acciones, estado)
           VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3, $4)`,
          [
            usuarioId,
            req.ip || 'unknown',
            'verificación manual de stocks',
            'exitoso'
          ]
        );
      } catch (bitacoraError) {
        console.log("⚠️ Error al registrar en bitácora:", bitacoraError.message);
      }
    }

    const tanquesCriticos = resultado.rows.filter(t => t.estado_alerta.includes('CRÍTICO')).length;
    const tanquesBajos = resultado.rows.filter(t => t.estado_alerta.includes('BAJO')).length;

    res.json({
      message: "Verificación manual completada",
      tanques: resultado.rows,
      total_tanques: resultado.rows.length,
      tanques_criticos: tanquesCriticos,
      tanques_bajos: tanquesBajos
    });
  } catch (error) {
    console.error("❌ Error en verificación manual:", error);
    res.status(500).json({ 
      error: "Error en verificación manual de stocks",
      details: error.message 
    });
  }
};

// Marcar alerta como resuelta
export const resolverAlerta = async (req, res) => {
  const { alerta_id } = req.params;
  const usuarioId = req.body.usuarioId || req.headers['user-id'];

  try {
    console.log("✅ Resolviendo alerta:", alerta_id);
    
    // Eliminar todas las notificaciones de usuario asociadas a esta alerta
    const deleteResult = await pool.query(
      `DELETE FROM usuario_notificacion 
       WHERE id_notificacion_producto = $1`,
      [alerta_id]
    );

    // También eliminar la notificación principal
    const deleteNotif = await pool.query(
      `DELETE FROM notificacion_producto WHERE id = $1`,
      [alerta_id]
    );

    // Registrar en bitácora
    if (usuarioId) {
      try {
        await pool.query(
          `INSERT INTO bitacora (usuario_id, ip, fecha_entrada, hora_entrada, acciones, estado)
           VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME, $3, $4)`,
          [
            usuarioId,
            req.ip || 'unknown',
            `alerta de inventario resuelta (ID: ${alerta_id})`,
            'exitoso'
          ]
        );
      } catch (bitacoraError) {
        console.log("⚠️ Error al registrar en bitácora:", bitacoraError.message);
      }
    }

    res.json({
      message: "Alerta marcada como resuelta",
      notificaciones_eliminadas: deleteResult.rowCount,
      alerta_eliminada: deleteNotif.rowCount > 0
    });
  } catch (error) {
    console.error("❌ Error al resolver alerta:", error);
    res.status(500).json({ 
      error: "Error al resolver alerta",
      details: error.message 
    });
  }
};

// Obtener alertas pendientes para un usuario específico
export const getAlertasPendientesUsuario = async (req, res) => {
  const { usuario_id } = req.params;

  try {
    console.log("🔔 Obteniendo alertas pendientes para usuario:", usuario_id);
    
    const result = await pool.query(`
      SELECT 
        un.id,
        np.titulo,
        np.descripcion,
        np.fecha,
        COALESCE(t.nombre, 'Sin tanque') as tanque_nombre,
        COALESCE(s.nombre, 'Sin sucursal') as sucursal_nombre,
        CASE 
          WHEN t.capacidad_max > 0 THEN ROUND((t.stock::DECIMAL / t.capacidad_max::DECIMAL) * 100, 1)
          ELSE 0
        END as porcentaje_stock
      FROM usuario_notificacion un
      JOIN notificacion_producto np ON un.id_notificacion_producto = np.id
      LEFT JOIN tanque t ON np.id_tanque = t.id
      LEFT JOIN sucursal s ON t.id_sucursal = s.id
      WHERE un.id_usuario = $1 
      AND un.visto = false
      ORDER BY np.fecha DESC
    `, [usuario_id]);

    res.json({
      alertas_pendientes: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error("❌ Error al obtener alertas pendientes:", error);
    res.status(500).json({ 
      error: "Error al obtener alertas pendientes",
      details: error.message 
    });
  }
};

// Función de prueba para verificar conexión
export const testAlertas = async (req, res) => {
  try {
    console.log("🧪 Test de alertas iniciado...");
    
    // Verificar conexión a base de datos
    const dbTest = await pool.query('SELECT NOW() as timestamp');
    
    // Verificar tablas principales
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('notificacion_producto', 'tanque', 'sucursal', 'usuario_notificacion')
      ORDER BY table_name
    `);
    
    // Contar registros en cada tabla
    const counts = {};
    for (const table of tables.rows) {
      try {
        const countResult = await pool.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
        counts[table.table_name] = countResult.rows[0].count;
      } catch (error) {
        counts[table.table_name] = `Error: ${error.message}`;
      }
    }
    
    res.json({
      status: "success",
      timestamp: dbTest.rows[0].timestamp,
      tables_found: tables.rows.map(t => t.table_name),
      record_counts: counts,
      message: "Sistema de alertas funcionando correctamente"
    });
  } catch (error) {
    console.error("❌ Error en test de alertas:", error);
    res.status(500).json({ 
      error: "Error en test de alertas",
      details: error.message 
    });
  }
};