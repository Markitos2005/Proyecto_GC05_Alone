import { validateHallazgo, validateHallazgoImages } from '../validation/hallazgos.js';

export class HallazgoError extends Error {
  constructor(status, message, errors) { super(message); this.status = status; this.errors = errors; }
}

/** SCRUM-49. El almacenamiento se conecta en SCRUM-105, sin inventar tablas ni categorías. */
export function createHallazgoService(storage) {
  async function context(userId) {
    const result = await storage.getPublicationContext(userId);
    if (!result?.facultad?.id || result.facultad.activo !== true) {
      throw new HallazgoError(403, 'Necesitas una facultad activa asignada para publicar hallazgos.');
    }
    return result;
  }
  return {
    async options(userId) {
      const current = await context(userId);
      return {
        facultad: { id: current.facultad.id, nombre: current.facultad.nombre },
        categorias: (current.categorias ?? []).filter(item => item.activo === true).map(item => ({ id: item.id, nombre: item.nombre })),
      };
    },
    async publish(userId, data, files) {
      const { errors, value } = validateHallazgo(data);
      if (Object.keys(errors).length) throw new HallazgoError(400, 'Revisa los datos del hallazgo.', errors);
      const current = await context(userId);
      if (!(current.categorias ?? []).some(item => item.id === value.categoriaId && item.activo === true)) {
        throw new HallazgoError(400, 'Selecciona una categoría activa.', { categoriaId: 'La categoría no existe o está inactiva.' });
      }
      const validated = await validateHallazgoImages(files);
      if (validated.error) throw new HallazgoError(400, 'Revisa las imágenes.', { imagenes: validated.error });
      // Raúl/SCRUM-105: publish debe guardar TODO o NADA, separar rasgos privados,
      // comprobar de nuevo rol/asignación/categoría en la transacción y limpiar fotos si falla.
      // Los buffers ya están validados. Usa nombres generados por el servidor.
      const created = await storage.publish({
        ...value, autorId: userId, facultadId: current.facultad.id,
        estado: 'Activo', imagenes: validated.images,
      });
      if (!created || typeof created.id !== 'string' || !created.id) throw new Error('Respuesta de almacenamiento inválida.');
      // Nunca devolver el objeto entero del repositorio: podría incluir rasgos privados.
      return { message: 'Hallazgo publicado correctamente.', hallazgo: { id: created.id, estado: 'Activo' } };
    },
  };
}
