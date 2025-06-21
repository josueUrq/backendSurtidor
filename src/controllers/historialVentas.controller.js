import { pool } from "../db.js";

// Obtener historial de ventas
export const getHistorialVentas = async (req, res) => {
  try {
    const { nombre, fecha_entrada } = req.query;
    let condiciones = [];
    let valores = [];
    let i = 1;

    if (nombre) {
      condiciones.push(`LOWER(c.nombre) LIKE LOWER($${i++})`);
      valores.push(`%${nombre}%`);
    }

    if (fecha_entrada) {
      condiciones.push(`DATE(nv.created_at) = $${i++}`);
      valores.push(fecha_entrada);
    }

    const whereClause =
      condiciones.length > 0 ? `WHERE ${condiciones.join(" AND ")}` : "";
    const result = await pool.query(
      `
  SELECT 
    nv.id,
    nv.codigo,
    c.nombre AS cliente_nombre,
    nv.cantidad,
    nv.monto_por_cobrar,
    nv.created_at,
    nv.hora
  FROM nota_venta nv
  LEFT JOIN cliente c ON nv.id_cliente = c.id
  ${whereClause}
  ORDER BY nv.created_at DESC
  `,
      valores
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener historial de ventas:", error);
    res.status(500).json({ error: "Error al obtener historial de ventas" });
  }
};

export const deleteVenta = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM nota_venta WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Venta no encontrada" });
    res.json({ message: "Venta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    res.status(500).json({ error: "Error al eliminar venta" });
  }
};
