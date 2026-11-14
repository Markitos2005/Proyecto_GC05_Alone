import { randomUUID } from 'node:crypto';
import { HallazgoError } from '../services/hallazgos.js';

// Asignación REAL y vigente del Conserje, nunca una facultad enviada por el navegador.
const ASIGNACION_VIGENTE = `
  FROM usuarios u
  JOIN asignaciones_conserje a ON a.usuario_id = u.id
  JOIN facultades f ON f.id = a.facultad_id
  WHERE u.id = $1 AND u.activo AND u.rol = 'CONSERJE'`;

/** SCRUM-105. Almacenamiento de hallazgos, rasgos privados y fotos en PostgreSQL. */
export function createHallazgoRepository(pool) {
  if (!pool) {
    // Sin base de datos (p. ej. pruebas que no la configuran): respuesta explícita, nunca éxito simulado.
    const unavailable = async () => {
      throw new HallazgoError(503, 'La publicación de hallazgos no está disponible en este momento.');
    };
    return { getPublicationContext: unavailable, publish: unavailable };
  }

  return {
    async getPublicationContext(userId) {
      const { rows: [facultad] } = await pool.query(`SELECT f.id, f.nombre, f.activo ${ASIGNACION_VIGENTE}`, [userId]);
      if (!facultad) return null;
      const { rows: categorias } = await pool.query(
        'SELECT id, nombre, activo FROM categorias WHERE activo ORDER BY nombre',
      );
      return { facultad, categorias };
    },

    /** Guarda TODO o NADA: hallazgo, rasgos privados y fotos en una única transacción. */
    async publish(input) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Volver a comprobar rol, asignación y categoría dentro de la transacción y
        // bloquearlos frente a cambios simultáneos hasta el COMMIT.
        const { rows: [vigente] } = await client.query(
          `SELECT f.id ${ASIGNACION_VIGENTE} AND f.id = $2 AND f.activo FOR SHARE OF u, a, f`,
          [input.autorId, input.facultadId],
        );
        if (!vigente) throw new HallazgoError(403, 'Necesitas una facultad activa asignada para publicar hallazgos.');

        const { rows: [categoria] } = await client.query(
          'SELECT id FROM categorias WHERE id = $1 AND activo FOR SHARE',
          [input.categoriaId],
        );
        if (!categoria) {
          throw new HallazgoError(400, 'Selecciona una categoría activa.', { categoriaId: 'La categoría no existe o está inactiva.' });
        }

        const id = randomUUID();
        await client.query(
          `INSERT INTO hallazgos (id, autor_id, facultad_id, categoria_id, descripcion, fecha_hallazgo,
             latitud, longitud, punto_entrega, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [id, input.autorId, input.facultadId, input.categoriaId, input.descripcion, input.fechaHallazgo,
            input.latitud, input.longitud, input.puntoEntrega || null, input.estado],
        );
        if (input.rasgosPrivados) {
          await client.query(
            'INSERT INTO hallazgo_rasgos_privados (hallazgo_id, rasgos) VALUES ($1, $2)',
            [id, input.rasgosPrivados],
          );
        }
        // Nombres e identificadores generados por el servidor; el nombre del archivo del cliente no se usa.
        for (const [index, image] of input.imagenes.entries()) {
          await client.query(
            'INSERT INTO hallazgo_imagenes (id, hallazgo_id, posicion, mime, datos) VALUES ($1, $2, $3, $4, $5)',
            [randomUUID(), id, index + 1, image.mime, image.buffer],
          );
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
