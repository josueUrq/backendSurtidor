import { pool } from "../db.js";

export const getCategorias = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM categoria ORDER BY nombre ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener categorías", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
export const getProductosDeCategoria = async (req, res) => {
  const { categoriaId } = req.params;
  const { sucursal } = req.query;

  try {
    const query = `
        SELECT p.*
        FROM producto p
        WHERE p.id_categoria = $1 AND p.id_sucursal = $2 
        ORDER BY p.nombre ASC
      `;
    const result = await pool.query(query, [categoriaId, sucursal]);
    res.json(result.rows);
  } catch (err) {
    console.error("Error al obtener productos por categoría y sucursal", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const createCategoria = async (req, res) => {
  const { nombre, descripcion, imagenUrl } = req.body;
  if (!nombre || !descripcion) {
    return res
      .status(400)
      .json({ error: "Nombre y descripción son requeridos" });
  }
  try {
    await pool.query(
      "INSERT INTO categoria (nombre, descripcion,imagen_url) VALUES ($1, $2, $3)",
      [nombre, descripcion, imagenUrl]
    );
    res.status(201).json({ mensaje: "Categoría creada con éxito" });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM categoria WHERE id = $1", [id]);
    res.status(204).json({ mensaje: "Categoría eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};
