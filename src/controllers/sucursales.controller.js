import { pool } from "../db.js";

export const getSucursales = async (req, res) => {
    try {
    // Verificar si la tabla combustible existe
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sucursales'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            return res.status(404).json({message: "Tabla sucursal no existe"});
        }
         
        //verificar la estructura de la tabla para determinar las columnas disponibles
        const columnCheck = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'sucursal'
            And table_name = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('Columnas disponibles en sucursal:', columnCheck.rows);

        //Obtener todas las sucursales 
        const result = await pool.query(`
            SELECT * FROM sucursal
            WHERE esta_suspendido = false
            ORDER BY created_at DESC
        `)
        
        res.json(result.rows);
    } catch (error) { 
        console.error('Error al obtener sucursales', error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const gestAllSucursales = async (req, res) => {
    try {
        //Obtener todas las sucursales incluyendo suspendidas
        const result = await pool.query(`
            SELECT * FROM sucursal
            ORDER BY created_at DESC
        `);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener todas las sucursales:', error)
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM sucursal WHERE id = $1', [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Sucursal no encontrada" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener sucursal:', error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const createSucursal = async (req, res) => {
    try {
        const { nombre, direccion, telefono, correo, id_empresa } = req.body;
        //Validaciones básicas
        if (!nombre || !direccion) {
            return res.status(400).json({
                message: "El nombre y la dirección son obligatorios"
            });
        }

        //verficar que no exista otra sucursalcon el mismo nombre en la misma empresa
        const esistingSucursal = await pool.query(
            'SELECT * FROM sucursal WHERE nombre = $1 AND id_empresa = $2 AND esta_suspendido = false', [nombre, id_empresa]
        );
        if (existingSucursal.rows.length > 0) {
            return res.status(400).json({
                message: "Ya existe una sucursal con ese nombre en esta empresa"
            });
        }

        const result = await pool.query (
            ` INSERT INTO sucursal (nombre, direccion, telefono, esta_suspendido, id_empresa) values ($1, $2, $3, $4, $5, $6) 
              RETURNING * `, [nombre, direccion, telefono || null, correo || null, false, id_empresa]  
        );

        res.status(201).json({
            message: "Error al crear sucursal:", sucursal: result.rows[0]
        }); 
    } catch (error) {
        console.error('Error al crear sucrsal:', error);
        //Manejar errores específicos de base de datos 
        if (error.code === '23505') {
            return res.status(400).json({
                message: "Ya existe una sucrssal con esos datos"
            });
        }

        if (error.code === '23505') {
            return res.status(400).json({
                message: "La empresa especificada no existe"
            });
        }
        res.status(500).json({ mesage: "Error interno del servidor"});
    }   
};

export const updateSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono, correo } = req.body;
        
        //Verificar que la sucursal existe
        const existingSucursal = await pool.query(
            'SELECT * FROM sucursal WHERE id = $1', [id]
        );

        if (existingSucursal.rows.length === 0) {
            return res.status(404).json({ message: "Sucursal no encontrada"});
        }
        
        //Validaciones básicas
        if (!nombre || !direccion) {
            return res.status(400).json({
                message: "El nombre y la dirección son obligatorios"
            });
        }
        
        //Verificar que no exista otra sucursal con el mismo nombre (excluyendo la actual)
        const duplicateCheck = await pool.query(
            'SELECT * FROM sucursal WHERE nombre = $1 AND id != $2 AND id_empresa = $3 AND esta_suspendido = false',
            [nombre, id, exixtingSucursal.rows[0].id_empresa]
        );
        
        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({
                message: "Ya existe otrta sucursal con ese nombre en esta empresa"
            });
        }
        
        const result = await pool.query(
            ` UPDATE sucursal
              SET nombre = $1, direccion = $2, telefono = $3, correo = $4
              WHERE id = $5
              RETURNIG * `, [nombre, direccion, telefono || null, correo || null, id]
        );
        
        res.json({
            message: "Sucursal actualizada exitosamente", sucursal: result.rwos[0]
        });
    } catch (error) {
        console.error('Error al actualizar sucursal', error);
        if (error.code === '23505') {
            return res.status(400).json({
                message: "Ya existe una sucursal con esos datos"
            });
        }
        res.status(500). json({ message: "Error interno del servidor" });
    }
};

export const deleteSucursal = async (req, res) => {
    try {
        const { id } = req.params;
        
        //Verificar que la sucrsal existe
        const existingSucursal =await pool.query(
            'SELECT * FROM sucursal WHERE id = $1', [id]
        );
        
        if (existingSucursal.rows.length === 0) {
            return res.status(404).json({ message: "Sucursal no encontrada"});
        }
        
        //Soft delete: marcar como suspendida en lugar de eliminar
        const result = await pool.query(
            ` UPDATE sucursal
              SET esta_suspendido = true
              WHERE id = $1
              RETURNING * `, [id]
        );
        
        res.json({
            message: "Sucursal suspendida exitosamente:", sucursal: result.rows[0]
        });
    } catch (error) {
        console.error('Error al suspender sucursal:', error);
        res.status(500).json({ message: "Error internodel servidor"});
    }
};

export const getSucursalesConProductos = async (req, res) => {
    try {
        //Esta función podría ser útil para obtener sucursales con información de productos
        const result = await pool.query(` 
            SELECT s.*, COUNT(p.id) AS total_productos
            FROM sucursal s
            LEFT JOIN productos p ON s.id = p.id_sucursal
            WHERE s.esta_suspendido = false
            GROUP BY s.id
            ORDER BY s.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener sucursales con productos:', error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};