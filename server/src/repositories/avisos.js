import { randomUUID } from 'node:crypto';
import { AvisoError } from '../services/avisos.js';

/** SCRUM-109. SQL parametrizado, catálogos activos y guardado atómico. */
export function createAvisoRepository(pool) {
  if (!pool) {
    const unavailable = async () => { throw new AvisoError(503, 'La publicación de avisos no está disponible en este momento.'); };
    return { options: unavailable, publish: unavailable };
  }
  return {
    async options() {
      const { rows: categorias } = await pool.query('SELECT id, nombre FROM categorias WHERE activo ORDER BY nombre, id');
      const { rows: facultades } = await pool.query('SELECT id, nombre FROM facultades WHERE activo ORDER BY nombre, id');
      const { rows: centros } = await pool.query(
        `SELECT c.id, c.nombre, c.facultad_id AS "facultadId" FROM centros c
         JOIN facultades f ON f.id = c.facultad_id WHERE c.activo AND f.activo ORDER BY c.nombre, c.id`);
      return { categorias, facultades, centros };
    },
    async publish(userId, data) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Revalidar dentro de la transacción, incluso si desactivan la cuenta tras requireAuth.
        const user = await client.query('SELECT id FROM usuarios WHERE id = $1 AND activo FOR SHARE', [userId]);
        if (!user.rowCount) throw new AvisoError(401, 'Debes iniciar sesión.');
        let facultadId = data.facultadId;
        const errors = {};
        if (data.centroId) {
          const { rows } = await client.query(
            `SELECT c.facultad_id FROM centros c JOIN facultades f ON f.id = c.facultad_id
             WHERE c.id = $1 AND c.activo AND f.activo FOR SHARE OF c, f`, [data.centroId]);
          if (!rows.length || (facultadId && facultadId !== rows[0].facultad_id)) {
            errors.centroId = 'El centro no existe, está inactivo o no pertenece a la facultad seleccionada.';
          } else facultadId = rows[0].facultad_id;
        }
        if (facultadId) {
          const faculty = await client.query('SELECT id FROM facultades WHERE id = $1 AND activo FOR SHARE', [facultadId]);
          if (!faculty.rowCount) errors.facultadId = 'La facultad no existe o está inactiva.';
        }
        const category = await client.query('SELECT id FROM categorias WHERE id = $1 AND activo FOR SHARE', [data.categoriaId]);
        if (!category.rowCount) errors.categoriaId = 'La categoría no existe o está inactiva.';
        if (Object.keys(errors).length) throw new AvisoError(400, 'Revisa los datos del aviso.', errors);
        const id = randomUUID();
        await client.query(
          `INSERT INTO avisos (id, autor_id, categoria_id, facultad_id, centro_id, descripcion, fecha_perdida, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'Activo')`,
          [id, userId, data.categoriaId, facultadId, data.centroId, data.descripcion, data.fechaPerdida]);
        if (data.rasgosPrivados || data.contactoEmail || data.contactoTelefono) {
          await client.query(
            `INSERT INTO aviso_datos_privados (aviso_id, rasgos, contacto_email, contacto_telefono) VALUES ($1, $2, $3, $4)`,
            [id, data.rasgosPrivados, data.contactoEmail, data.contactoTelefono]);
        }
        await client.query('COMMIT');
        return { id };
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    },
  };
}
