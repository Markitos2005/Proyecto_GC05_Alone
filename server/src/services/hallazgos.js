import {
  validateHallazgo,
  validateHallazgoImages,
  validateHallazgoUpdate,
  validateHallazgoStateChange,
} from '../validation/hallazgos.js';
import validator from 'validator';

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
    async getOwn(userId, hallazgoId) {
      if (typeof hallazgoId !== 'string' || !validator.isUUID(hallazgoId)) {
        throw new HallazgoError(400, 'El identificador del hallazgo no es válido.');
      }

      const hallazgo = await storage.getOwnHallazgo(userId, hallazgoId);

      if (!hallazgo) {
        // El mismo mensaje para un hallazgo inexistente y uno ajeno.
        // Así evitamos revelar información sobre otros usuarios.
        throw new HallazgoError(404, 'Hallazgo no encontrado.');
      }

      return { hallazgo };
    },
    async getOwnImage(userId, hallazgoId, imagenId) {
      if (
        typeof hallazgoId !== 'string' ||
        !validator.isUUID(hallazgoId) ||
        typeof imagenId !== 'string' ||
        !validator.isUUID(imagenId)
      ) {
        throw new HallazgoError(400, 'El identificador no es válido.');
      }

      const imagen = await storage.getOwnHallazgoImage(
        userId,
        hallazgoId,
        imagenId,
      );

      if (!imagen) {
        // No revelar si la imagen existe pero pertenece a otro usuario.
        throw new HallazgoError(404, 'Imagen no encontrada.');
      }

      return imagen;
    },
    async getOwnHistory(userId, hallazgoId) {
      if (typeof hallazgoId !== 'string' || !validator.isUUID(hallazgoId)) {
        throw new HallazgoError(400, 'El identificador del hallazgo no es válido.');
      }

      const historial = await storage.getOwnHallazgoHistory(userId, hallazgoId);

      if (historial === null) {
        throw new HallazgoError(404, 'Hallazgo no encontrado.');
      }

      return {
        historial,
      };
    },
    async updateOwn(userId, hallazgoId, data) {
      if (typeof hallazgoId !== 'string' || !validator.isUUID(hallazgoId)) {
        throw new HallazgoError(400, 'El identificador del hallazgo no es válido.');
      }

      const { errors, value } = validateHallazgoUpdate(data);

      if (Object.keys(errors).length) {
        throw new HallazgoError(400, 'Revisa los datos del hallazgo.', errors);
      }

      const updated = await storage.updateOwnHallazgo(userId, hallazgoId, value);

      return {
        message: 'Hallazgo actualizado correctamente.',
        hallazgo: {
          id: updated.id,
          estado: updated.estado,
        },
      };
    },
    async changeOwnState(userId, hallazgoId, data) {
      if (typeof hallazgoId !== 'string' || !validator.isUUID(hallazgoId)) {
        throw new HallazgoError(400, 'El identificador del hallazgo no es válido.');
      }

      const { errors, value } = validateHallazgoStateChange(data);

      if (Object.keys(errors).length) {
        throw new HallazgoError(400, 'Revisa el cambio de estado.', errors);
      }

      const updated = await storage.changeOwnHallazgoState(
        userId,
        hallazgoId,
        value.estado,
        value.motivo,
      );

      return {
        message: 'Estado del hallazgo actualizado correctamente.',
        hallazgo: {
          id: updated.id,
          estado: updated.estado,
        },
      };
    },
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
