import { pool } from "../db.js";

// Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM rol");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res.status(500).json({ message: "Error al obtener roles" });
  }
};

// Obtener todos los permisos
export const getPermisos = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM permiso ORDER BY nombre");
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    res.status(500).json({ message: "Error al obtener permisos" });
  }
};

// Obtener permisos por ID de rol
export const getPermisosPorRol = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion
       FROM permiso_rol pr
       JOIN permiso p ON pr.id_permiso = p.id
       WHERE pr.id_rol = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener permisos por rol:", error);
    res.status(500).json({ message: "Error al obtener permisos por rol" });
  }
};

// Obtener permisos de un usuario por su ID
export const getPermisosPorUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const permisosPersonalizados = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion
       FROM permiso_usuario pu
       JOIN permiso p ON pu.id_permiso = p.id
       WHERE pu.id_usuario = $1`,
      [id]
    );

    let permisos = permisosPersonalizados.rows;

    // Obtener también el nombre del rol del usuario
    const rolUsuario = await pool.query(
      `SELECT r.nombre 
       FROM usuario u
       JOIN rol r ON u.id_rol = r.id
       WHERE u.id = $1`,
      [id]
    );

    const rol = rolUsuario.rows[0]?.nombre || null;

    // Si no tiene permisos personalizados, usar los del rol
    if (permisos.length === 0) {
      const permisosPorRol = await pool.query(
        `SELECT p.id, p.nombre, p.descripcion
         FROM usuario u
         JOIN permiso_rol pr ON u.id_rol = pr.id_rol
         JOIN permiso p ON pr.id_permiso = p.id
         WHERE u.id = $1`,
        [id]
      );
      permisos = permisosPorRol.rows;
    }

    res.json({ permisos, rol });
  } catch (error) {
    console.error("Error al obtener permisos del usuario:", error);
    res.status(500).json({ message: "Error al obtener permisos del usuario" });
  }
};

// Actualizar rol de un usuario
export const actualizarRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { id_rol } = req.body;

  try {
    await pool.query("UPDATE usuario SET id_rol = $1 WHERE id = $2", [
      id_rol,
      id,
    ]);
    res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ message: "Error al actualizar rol" });
  }
};

// Actualizar permisos de un rol (se usará cuando un admin edite)
export const actualizarPermisosUsuario = async (req, res) => {
  const { id } = req.params;
  const { id_rol, permisosSeleccionados } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Actualizar el rol del usuario
    await client.query("UPDATE usuario SET id_rol = $1 WHERE id = $2", [
      id_rol,
      id,
    ]);

    // Borrar permisos personalizados existentes del usuario
    await client.query("DELETE FROM permiso_usuario WHERE id_usuario = $1", [
      id,
    ]);

    // Insertar nuevos permisos personalizados
    for (const permisoId of permisosSeleccionados) {
      await client.query(
        "INSERT INTO permiso_usuario (id_usuario, id_permiso) VALUES ($1, $2)",
        [id, permisoId]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Permisos personalizados actualizados correctamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar permisos personalizados:", error);
    res
      .status(500)
      .json({ message: "Error al actualizar permisos personalizados" });
  } finally {
    client.release();
  }
};
