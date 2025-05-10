import { pool } from "../db.js";

export const createProducto = async (req, res) => {
  try {
    const {
      nombre,
      stock,
      stock_minimo,
      descripcion,
      unidad_medida,
      precio_venta,
      precio_compra,
      iva,
      esta_activo,
      categoria_id,
      sucursal_id,
      proveedor_id,
      oferta_id,
    } = req.body;

    // Aquí detectamos si subieron imagen
    const url_image = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO producto (nombre, stock, stock_minimo, descripcion, unidad_medida, precio_venta,
precio_compra, iva, url_image, esta_activo, id_categoria, id_sucursal, id_proveedor, id_descuento)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12,$13,$14)
    RETURNING *`,
      [
        nombre,
        stock,
        stock_minimo,
        descripcion,
        unidad_medida,
        precio_venta,
        precio_compra,
        iva,
        url_image,
        esta_activo,
        categoria_id,
        sucursal_id,
        proveedor_id,
        oferta_id === "" ? null : oferta_id,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
};



// Actualizar producto
export const updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio_venta,
      precio_compra,
      unidad_medida,
      stock,
      stock_minimo,
      iva,
      proveedor_id,
      categoria_id,
      sucursal_id,
      esta_activo,
      oferta_id,
    } = req.body;

    // Detectar si hay nueva imagen
    const nuevaUrlImage = req.file ? req.file.filename : req.body.url_image;

    const result = await pool.query(
      `UPDATE producto 
      SET nombre=$1, stock=$2, stock_minimo=$3, descripcion=$4, unidad_medida=$5, precio_venta=$6,
      precio_compra=$7, iva=$8, url_image=$9, esta_activo=$10, id_categoria=$11, id_sucursal=$12, 
      id_proveedor=$13, id_descuento=$14
      WHERE id=$15 
      RETURNING *`,
      [
        nombre,
        stock,
        stock_minimo,
        descripcion,
        unidad_medida,
        precio_venta,
        precio_compra,
        iva,
        nuevaUrlImage,
        esta_activo,
        categoria_id,
        sucursal_id,
        proveedor_id,
        oferta_id === "" ? null : oferta_id,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};


// Eliminar producto
export const deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM producto WHERE id = $1`, [id]);
    res.status(204).json({ mensaje: "Producto eliminada con éxito" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
};
