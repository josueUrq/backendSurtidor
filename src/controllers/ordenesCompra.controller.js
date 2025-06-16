import { pool } from "../db.js";

export const listarOrdenesCompra = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        nc.id,
        nc.hora,
        nc.monto_total,
        nc.created_at,
        nc.estado,
        nc.cantidad, 
        p.nombre AS proveedor,
        s.nombre AS sucursal,
        u.nombre AS usuario,
        t.nombre AS tanque
      FROM nota_de_compra nc
      JOIN proveedor p ON p.id = nc.id_proveedor
      JOIN sucursal s ON s.id = nc.id_sucursal
      JOIN usuario u ON u.id = nc.id_usuario
      JOIN tanque t ON t.id = nc.id_tanque
      ORDER BY nc.created_at DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error("Error al obtener órdenes de compra:", error.message, error.stack);
    res.status(500).json({
      msg: "Error al obtener órdenes de compra"
    });
  }
};


export const agregarOrdenCompra = async (req, res) => {
  try {
    const {
      hora,
      monto_total,
      id_proveedor,
      id_sucursal,
      id_usuario,
      id_tanque
    } = req.body;

    if (!hora || !monto_total || !id_proveedor || !id_sucursal || !id_usuario || !id_tanque) {
      return res.status(400).json({ ok: false, msg: "Faltan datos requeridos" });
    }

    const horaStr = String(hora); // Asegura formato "HH:MM:SS"

    const result = await pool.query(
      `INSERT INTO nota_de_compra 
        (hora, monto_total, id_proveedor, id_sucursal, id_usuario,id_tanque)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [horaStr, monto_total, id_proveedor, id_sucursal, id_usuario,id_tanque]
    );

    res.status(201).json({
      ok: true,
      msg: "Orden de compra registrada",
      orden: result.rows[0]
    });

  } catch (error) {
    console.error("Error al registrar orden de compra:", error.message, error.stack);
    res.status(500).json({
      ok: false,
      msg: "Error interno al registrar orden de compra"
    });
  }
};

export const eliminarOrdenCompra = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM nota_de_compra WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, msg: 'Orden no encontrada' });
    }

    res.json({ ok: true, msg: 'Orden eliminada correctamente' });

  } catch (error) {
    console.error('Error al eliminar orden de compra:', error.message, error.stack);
    res.status(500).json({ ok: false, msg: 'Error al eliminar orden de compra' });
  }
};

export const actualizarEstadoOrdenCompra = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const result = await pool.query(
      'UPDATE nota_de_compra SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, msg: 'Orden no encontrada' });
    }

    res.json({
      ok: true,
      msg: 'Estado de la orden actualizado correctamente',
      orden: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error.message, error.stack);
    res.status(500).json({ ok: false, msg: 'Error al actualizar el estado de la orden' });
  }
};