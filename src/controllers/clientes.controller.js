import { pool } from "../db.js";

// Buscar cliente por placa
export const buscarClientePorPlaca = async (req, res) => {
  const { placa } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM cliente WHERE placa = $1",
      [placa]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    res.status(500).json({ message: "Error al buscar cliente" });
  }
};


export const registrarCliente = async (req, res) => {
  const { nombre, nit, placa, b_sisa, id_sucursal } = req.body;

 
  if (!nombre || !nit || !placa || b_sisa === undefined || !id_sucursal) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const existe = await pool.query(
      "SELECT * FROM cliente WHERE placa = $1",
      [placa]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ mensaje: "Placa ya registrada" });
    }

    const resultado = await pool.query(
      `INSERT INTO cliente (nombre, nit, placa, b_sisa, id_sucursal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nombre, nit, placa, b_sisa, id_sucursal]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    res.status(500).json({ mensaje: "Error del servidor" });
  }
};
