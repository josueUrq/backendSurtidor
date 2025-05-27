import Stripe from 'stripe';
import { pool } from "../db.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const crearSessionPago = async (req, res) => {
  const { monto } = req.body;

  if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
    return res.status(400).json({ error: 'Monto inválido o menor a 1 USD' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card','cashapp'],
        mode: "payment",
      currency: "usd", 
      line_items: [
        {
          price_data: {
            currency: "usd", 
            product_data: {
              name: "Carga de combustible",
            },
            unit_amount: Math.round(monto * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error al crear sesión de Stripe:', error);
    res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
};


export const verificarFactura = async (req, res) => {
  try {
    const {
      codigo, 
      monto_pagado,
      monto_por_cobrar,
      monto_cambio,
      hora,
      id_sucursal,
      id_usuario,
      id_dispensador,
      id_cliente,
      created_at
    } = req.body;

    // Validación de campos
    if (
      !codigo || !monto_pagado || !id_usuario || !hora ||
      !id_sucursal || !id_dispensador || !id_cliente
    ) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos requeridos' });
    }

    const result = await pool.query(
      `INSERT INTO nota_venta 
        (codigo, monto_pagado, monto_por_cobrar, monto_cambio, hora,
         id_sucursal, id_usuario, id_dispensador, id_cliente, created_at)
       VALUES 
        ($1, $2, $3, $4, $5,
         $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        codigo,
        monto_pagado.toString(),
        monto_por_cobrar,
        monto_cambio.toString(),
        hora,
        id_sucursal,
        id_usuario,
        id_dispensador,
        id_cliente,
        created_at
      ]
    );

    return res.status(201).json({
      ok: true,
      msg: 'Factura registrada correctamente',
      factura: result.rows[0]
    });

  } catch (error) {
    console.error('Error al registrar factura:', error);
    return res.status(500).json({
      ok: false,
      msg: 'Error interno al registrar factura'
    });
  }
};
