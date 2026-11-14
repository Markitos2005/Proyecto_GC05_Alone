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
    const searchUnavailable = async () => {
      throw new HallazgoError(503, 'La búsqueda de hallazgos no está disponible en este momento.');
    };
    return { getPublicationContext: unavailable, publish: unavailable, search: searchUnavailable, getImage: searchUnavailable };
  }

  return {
    /** SCRUM-107 / US-009. Solo hallazgos Activos y solo columnas públicas: nunca rasgos privados ni datos del autor.
     * Orden estable (más recientes primero, id como desempate) y `corte` fijo: al paginar no se duplican ni se pierden resultados. */
    async search({ terminos, categoriaId, facultadId, fechaDesde, fechaHasta, pagina, tamano, corte }) {
      const client = await pool.connect();
      try {
        // Ambas consultas ven la misma instantánea de la base de datos.
        await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
        const instante = corte || (await client.query("SELECT to_json(clock_timestamp()) #>> '{}' AS corte")).rows[0].corte;
        const params = [instante];
        const where = ["h.estado = 'Activo'", 'h.created_at <= $1::timestamptz'];
        const add = (sql, value) => { params.push(value); where.push(sql.replace('?', `$${params.length}`)); };
        // Cada palabra debe aparecer en la descripción pública; % y _ se buscan como texto literal.
        for (const termino of terminos) add('h.descripcion ILIKE ?', `%${termino.replace(/[\\%_]/g, '\\$&')}%`);
        if (categoriaId) add('h.categoria_id = ?::uuid', categoriaId);
        if (facultadId) add('h.facultad_id = ?::uuid', facultadId);
        if (fechaDesde) add('h.fecha_hallazgo >= ?::date', fechaDesde);
        if (fechaHasta) add('h.fecha_hallazgo <= ?::date', fechaHasta);
        const filtro = where.join(' AND ');

        const { rows: [{ total }] } = await client.query(`SELECT count(*)::int AS total FROM hallazgos h WHERE ${filtro}`, params);
        const { rows } = await client.query(
          `SELECT h.id, h.descripcion, to_char(h.fecha_hallazgo, 'YYYY-MM-DD') AS fecha_hallazgo,
                  h.latitud, h.longitud, h.punto_entrega, h.estado, to_json(h.created_at) #>> '{}' AS publicado_en,
                  c.id AS categoria_id, c.nombre AS categoria_nombre, f.id AS facultad_id, f.nombre AS facultad_nombre,
                  COALESCE((SELECT array_agg(i.posicion ORDER BY i.posicion) FROM hallazgo_imagenes i WHERE i.hallazgo_id = h.id), '{}') AS imagenes
             FROM hallazgos h
             JOIN categorias c ON c.id = h.categoria_id
             JOIN facultades f ON f.id = h.facultad_id
            WHERE ${filtro}
            ORDER BY h.created_at DESC, h.id DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          [...params, tamano, (pagina - 1) * tamano],
        );
        await client.query('COMMIT');
        return { total, corte: instante, hallazgos: rows };
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    },

    /** Foto pública: solo si el hallazgo sigue Activo. */
    async getImage(hallazgoId, posicion) {
      const { rows } = await pool.query(
        `SELECT i.mime, i.datos FROM hallazgo_imagenes i JOIN hallazgos h ON h.id = i.hallazgo_id
          WHERE h.id = $1 AND i.posicion = $2 AND h.estado = 'Activo'`,
        [hallazgoId, posicion],
      );
      return rows[0] ?? null;
    },

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
