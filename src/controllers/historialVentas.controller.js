import { pool } from "../db.js";

// Obtener historial de ventas
export const getHistorialVentas = async (req, res) => {
  try {
    const result = await pool.query(`
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
  ORDER BY nv.created_at DESC
`);
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
