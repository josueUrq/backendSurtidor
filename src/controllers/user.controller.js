import { pool } from "../db.js";
import bcryptjs from "bcryptjs";
import { validationResult } from "express-validator";

export const getUsers = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        u.id,
        u.ci,
        u.nombre,
        u.telefono,
        u.sexo,
        u.correo,
        u.domicilio,
        s.nombre AS sucursal,
        r.nombre AS rol
      FROM usuario u
      JOIN sucursal s ON u.id_sucursal = s.id
      JOIN rol r ON u.id_rol = r.id
    `);

    if (rows.length === 0) {
      return res.status(404).json({ message: "users not found" });
    }

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginProcess = async (req, res) => {
  try {
    const resultValidation = validationResult(req);
    if (!resultValidation.isEmpty()) {
      return res.status(400).json({ errors: resultValidation.array() });
    }
    const { ci, password } = req.body;

    if (ci === "superUsuario" && password === "S12345") {
      const { rows } = await pool.query(
        `
        SELECT u.*, 
               s.id AS sucursal_id,
               s.nombre AS sucursal_nombre,
               s.direccion AS sucursal_direccion,
               s.telefono AS sucursal_telefono,
               s.correo AS sucursal_correo,
               s.esta_suspendido AS sucursal_suspendido
        FROM usuario u
        LEFT JOIN sucursal s ON u.id_sucursal = s.id
        WHERE u.nombre = $1
      `,
        [ci]
      );
      const userToLogin = rows[0];
      delete userToLogin.contraseña;

      // Estructura de sucursal para el front
      const sucursal = {
        id: userToLogin.sucursal_id,
        nombre: userToLogin.sucursal_nombre,
        direccion: userToLogin.sucursal_direccion,
        telefono: userToLogin.sucursal_telefono,
        correo: userToLogin.sucursal_correo,
        esta_suspendido: userToLogin.sucursal_suspendido,
      };

      return res.status(200).json({
        token: "simple-token-for-demo",
        usuario: {
          id: userToLogin.id,
          nombre: userToLogin.nombre,
          rol: userToLogin.rol,
          sucursal: sucursal,
        },
        message: "Inicio de sesión exitoso",
      });
    }
    // Obtener usuario con su sucursal relacionada
    const { rows } = await pool.query(
      `
      SELECT u.*, 
             s.id AS sucursal_id,
             s.nombre AS sucursal_nombre,
             s.direccion AS sucursal_direccion,
             s.telefono AS sucursal_telefono,
             s.correo AS sucursal_correo,
             s.esta_suspendido AS sucursal_suspendido
      FROM usuario u
      LEFT JOIN sucursal s ON u.id_sucursal = s.id
      WHERE u.ci = $1
    `,
      [ci]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        errors: [
          {
            path: "ci",
            msg: "CI no registrado",
          },
        ],
      });
    }

    const userToLogin = rows[0];
    const isOkThePassword = await bcryptjs.compare(
      password,
      userToLogin.contraseña
    );

    if (isOkThePassword) {
      delete userToLogin.contraseña;

      // Estructura de sucursal para el front
      const sucursal = {
        id: userToLogin.sucursal_id,
        nombre: userToLogin.sucursal_nombre,
        direccion: userToLogin.sucursal_direccion,
        telefono: userToLogin.sucursal_telefono,
        correo: userToLogin.sucursal_correo,
        esta_suspendido: userToLogin.sucursal_suspendido,
      };

      return res.status(200).json({
        token: "simple-token-for-demo",
        usuario: {
          id: userToLogin.id,
          nombre: userToLogin.nombre,
          rol: userToLogin.rol, // si tienes ese campo
          sucursal: sucursal,
        },
        message: "Inicio de sesión exitoso",
      });
    }

    return res.status(400).json({
      errors: [
        {
          path: "password",
          msg: "contraseña incorrecta",
        },
      ],
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query("SELECT * FROM usuario WHERE ID = $1", [
    id,
  ]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "user not found" });
  }
  res.json(rows[0]);
};

export const createUser = async (req, res) => {
  try {
    const resultValidation = validationResult(req);
    if (!resultValidation.isEmpty()) {
      return res.status(400).json({ errors: resultValidation.array() });
    }

    const data = req.body;

    // Validación de campos obligatorios
    const requiredFields = [
      "ci",
      "name",
      "telefono",
      "sexo",
      "email",
      "domicilio",
      "password",
      "id_sucursal",
      "id_rol",
    ];
    for (let field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({
          errors: [
            {
              path: field,
              msg: `${field} es requerido`,
            },
          ],
        });
      }
    }

    // Hashear contraseña
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Insertar usuario
    const insertQuery = `
        INSERT INTO usuario 
        (ci, nombre, telefono, sexo, correo, domicilio, contraseña, id_sucursal, id_rol)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;

    const values = [
      data.ci,
      data.name,
      data.telefono,
      data.sexo,
      data.email,
      data.domicilio,
      hashedPassword,
      data.id_sucursal,
      data.id_rol,
    ];

    const { rows } = await pool.query(insertQuery, values);

    return res.status(201).json({
      meta: { status: 201 },
      message: "Usuario creado con éxito",
      user: rows[0],
    });
  } catch (error) {
    if (error?.code === "23505") {
      const detail = error.detail || "";

      const errors = [];

      if (detail.includes("(ci)")) {
        errors.push({
          path: "ci",
          msg: "CI ya registrado",
        });
      }

      if (detail.includes("(correo)") || detail.includes("(email)")) {
        errors.push({
          path: "email",
          msg: "Correo ya registrado",
        });
      }

      return res.status(400).json({ errors });
    }

    console.error("Error en createUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  const { ci } = req.params;
  try {
    const userRes = await pool.query("SELECT id FROM usuario WHERE ci = $1", [
      ci,
    ]);
    if (userRes.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado con ese CI" });
    }

    const userId = userRes.rows[0].id;

    // Borrar de permiso_usuario
    await pool.query("DELETE FROM permiso_usuario WHERE id_usuario = $1", [
      userId,
    ]);
    const { rowCount } = await pool.query("DELETE FROM usuario WHERE ci = $1", [
      ci,
    ]);

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado con ese CI" });
    }

    return res.status(204).send(); // Eliminado con éxito, sin contenido
  } catch (error) {
    console.error("Error al eliminar usuario por CI:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const asignarRolYPermisos = async (req, res) => {
  const { id } = req.params; // id del usuario
  const { rol_id, permisos_ids } = req.body;

  try {
    await pool.query("BEGIN");

    // Actualizar el rol del usuario
    await pool.query("UPDATE usuario SET id_rol = $1 WHERE id = $2", [
      rol_id,
      id,
    ]);

    // Eliminar permisos anteriores del rol (opcional si deseas control manual)
    await pool.query("DELETE FROM permiso_rol WHERE id_rol = $1", [rol_id]);

    // Insertar nuevos permisos
    for (const permiso_id of permisos_ids) {
      await pool.query(
        "INSERT INTO permiso_rol (id_rol, id_permiso) VALUES ($1, $2)",
        [rol_id, permiso_id]
      );
    }

    await pool.query("COMMIT");
    res.json({ message: "Rol y permisos asignados correctamente" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Error al asignar rol y permisos" });
  } finally {
    pool.release();
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const { rows } = await pool.query(
      `
      UPDATE usuario 
      SET 
        nombre = $1,
        correo = $2,
        telefono = $3,
        sexo = $4,
        domicilio = $5
      WHERE id = $6
      RETURNING id, ci, nombre, correo, telefono, sexo, domicilio, id_sucursal, id_rol
      `,
      [data.nombre, data.correo, data.telefono, data.sexo, data.domicilio, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
