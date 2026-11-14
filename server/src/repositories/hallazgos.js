import { randomUUID } from 'node:crypto';
import { HallazgoError } from '../services/hallazgos.js';

/** SCRUM-105. Almacenamiento de hallazgos, rasgos privados y fotos en PostgreSQL.
 * Cualquier cuenta activa puede publicar (SCRUM-103); la tabla asignaciones_conserje
 * queda preparada para cuando la publicación se reserve a Conserjería (US-025). */
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
      const { rowCount } = await pool.query('SELECT 1 FROM usuarios WHERE id = $1 AND activo', [userId]);
      if (!rowCount) return null;
      const { rows: facultades } = await pool.query('SELECT id, nombre, activo FROM facultades WHERE activo ORDER BY nombre');
      const { rows: categorias } = await pool.query('SELECT id, nombre, activo FROM categorias WHERE activo ORDER BY nombre');
      return { facultades, categorias };
    },

    /** Guarda TODO o NADA: hallazgo, rasgos privados y fotos en una única transacción. */
    async publish(input) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // Volver a comprobar cuenta, facultad y categoría dentro de la transacción y
        // bloquearlas frente a cambios simultáneos hasta el COMMIT.
        const { rowCount: cuenta } = await client.query(
          'SELECT 1 FROM usuarios WHERE id = $1 AND activo FOR SHARE', [input.autorId],
        );
        if (!cuenta) throw new HallazgoError(403, 'Tu cuenta no puede publicar hallazgos.');

        const { rowCount: facultad } = await client.query(
          'SELECT 1 FROM facultades WHERE id = $1 AND activo FOR SHARE', [input.facultadId],
        );
        if (!facultad) {
          throw new HallazgoError(400, 'Selecciona una facultad activa.', { facultadId: 'La facultad no existe o está inactiva.' });
        }

        const { rowCount: categoria } = await client.query(
          'SELECT 1 FROM categorias WHERE id = $1 AND activo FOR SHARE', [input.categoriaId],
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
