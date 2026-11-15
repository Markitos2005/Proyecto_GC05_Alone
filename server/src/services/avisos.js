import { validateAviso } from '../validation/avisos.js';

export class AvisoError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function createAvisoService(storage) {
  return {
    async options() {
      const { categorias, facultades, centros } = await storage.options();
      const option = ({ id, nombre }) => ({ id, nombre });
      return {
        categorias: categorias.map(option), facultades: facultades.map(option),
        centros: centros.map(({ id, nombre, facultadId }) => ({ id, nombre, facultadId })),
      };
    },
    async publish(userId, body) {
      const { errors, value } = validateAviso(body);
      if (Object.keys(errors).length) throw new AvisoError(400, 'Revisa los datos del aviso.', errors);
      const saved = await storage.publish(userId, value);
      // Lista explícita: ni correo, ni rasgos, ni datos del autor salen en la respuesta.
      return { message: 'Aviso de pérdida publicado correctamente.', aviso: { id: saved.id, estado: 'Activo' } };
    },
  };
}
