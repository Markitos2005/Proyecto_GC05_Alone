import { validateHallazgo, validateHallazgoImages } from '../validation/hallazgos.js';

export class HallazgoError extends Error {
  constructor(status, message, errors) { super(message); this.status = status; this.errors = errors; }
}

const active = (items) => (items ?? []).filter(item => item.activo === true);
const publicItem = (item) => ({ id: item.id, nombre: item.nombre });

/** SCRUM-49 / SCRUM-103. Cualquier usuario autenticado y activo publica hallazgos.
 * El almacenamiento (SCRUM-105) está en repositories/hallazgos.js. */
export function createHallazgoService(storage) {
  async function context(userId) {
    const result = await storage.getPublicationContext(userId);
    if (!result) throw new HallazgoError(403, 'Tu cuenta no puede publicar hallazgos.');
    return result;
  }
  return {
    async options(userId) {
      const current = await context(userId);
      return {
        facultades: active(current.facultades).map(publicItem),
        categorias: active(current.categorias).map(publicItem),
      };
    },
    async publish(userId, data, files) {
      const { errors, value } = validateHallazgo(data);
      if (Object.keys(errors).length) throw new HallazgoError(400, 'Revisa los datos del hallazgo.', errors);
      const current = await context(userId);
      if (!active(current.facultades).some(item => item.id === value.facultadId)) {
        throw new HallazgoError(400, 'Selecciona una facultad activa.', { facultadId: 'La facultad no existe o está inactiva.' });
      }
      if (!active(current.categorias).some(item => item.id === value.categoriaId)) {
        throw new HallazgoError(400, 'Selecciona una categoría activa.', { categoriaId: 'La categoría no existe o está inactiva.' });
      }
      const validated = await validateHallazgoImages(files);
      if (validated.error) throw new HallazgoError(400, 'Revisa las imágenes.', { imagenes: validated.error });
      // SCRUM-105: el repositorio guarda TODO o NADA en una transacción, separa los rasgos
      // privados y vuelve a comprobar cuenta, facultad y categoría antes de guardar.
      const created = await storage.publish({
        ...value, autorId: userId, estado: 'Activo', imagenes: validated.images,
      });
      if (!created || typeof created.id !== 'string' || !created.id) throw new Error('Respuesta de almacenamiento inválida.');
      // Nunca devolver el objeto entero del repositorio: podría incluir rasgos privados.
      return { message: 'Hallazgo publicado correctamente.', hallazgo: { id: created.id, estado: 'Activo' } };
    },
  };
}
