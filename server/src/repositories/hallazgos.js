import { HallazgoError } from '../services/hallazgos.js';

/** PUNTO DE CONEXIÓN PARA RAÚL — SCRUM-105.
 * La tabla y el almacenamiento de imágenes le corresponden a esa subtarea.
 * Sustituir estas operaciones por consultas reales usando pool; no guardar en memoria.
 *
 * getPublicationContext(userId) devuelve:
 * { facultad: { id, nombre, activo }, categorias: [{ id, nombre, activo }] }
 * Consultar la asignación REAL y vigente, nunca una facultad enviada por el navegador.
 * Sin asignación: devolver null. No crear categorías ni facultades de ejemplo en producción.
 *
 * publish({ autorId, facultadId, categoriaId, descripcion, fechaHallazgo,
 *   latitud, longitud, puntoEntrega, rasgosPrivados, estado, imagenes }) devuelve { id }.
 * imagenes: [{ buffer: Buffer, mime: 'image/jpeg'|'image/png', extension: 'jpg'|'png' }].
 * Guardar rasgosPrivados aparte y no publicarlos en URLs/feeds. Comprobar otra vez
 * permisos y datos activos en la misma transacción y revertir filas/fotos si falla.
 * El autor y estado ya los fija SCRUM-49, no el formulario.
 */
export function createHallazgoRepository(_pool) {
  const pending = async () => {
    throw new HallazgoError(503, 'La publicación está pendiente de conectar con el almacenamiento de SCRUM-105.');
  };
  return { getPublicationContext: pending, publish: pending };
}
