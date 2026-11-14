import sharp from 'sharp';
import validator from 'validator';

// Jira SCRUM-105: 1–5 imágenes JPG/PNG de hasta 5 MiB cada una.
export const HALLAZGO_MAX_IMAGES = 5;
export const HALLAZGO_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Límites técnicos del contrato de esta API, no nuevas estimaciones ni requisitos del profesor.
export const HALLAZGO_TEXT_MAX = 2000;
const allowedFields = ['categoriaId', 'descripcion', 'fechaHallazgo', 'latitud', 'longitud', 'puntoEntrega', 'rasgosPrivados'];

export function validateHallazgo(data, today = new Date().toISOString().slice(0, 10)) {
  const errors = {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { errors: { datos: 'Envía un objeto JSON en el campo datos.' } };
  if (Object.keys(data).some(key => !allowedFields.includes(key))) errors.datos = 'Hay campos no permitidos. El autor, la facultad y el estado los decide el servidor.';
  const categoriaId = typeof data.categoriaId === 'string' ? data.categoriaId : '';
  if (!validator.isUUID(categoriaId)) errors.categoriaId = 'Selecciona una categoría válida.';
  const descripcion = typeof data.descripcion === 'string' ? data.descripcion.trim() : '';
  if (!descripcion || [...descripcion].length > HALLAZGO_TEXT_MAX) errors.descripcion = 'Introduce una descripción de entre 1 y 2000 caracteres.';
  const fechaHallazgo = typeof data.fechaHallazgo === 'string' ? data.fechaHallazgo : '';
  const date = new Date(`${fechaHallazgo}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaHallazgo) || !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== fechaHallazgo || fechaHallazgo > today) {
    errors.fechaHallazgo = 'Indica una fecha existente que no sea futura (AAAA-MM-DD).';
  }
  // Raúl: enviar números JSON, no cadenas; 0 es una coordenada válida.
  if (typeof data.latitud !== 'number' || !Number.isFinite(data.latitud) || Math.abs(data.latitud) > 90) errors.latitud = 'La latitud debe estar entre -90 y 90.';
  if (typeof data.longitud !== 'number' || !Number.isFinite(data.longitud) || Math.abs(data.longitud) > 180) errors.longitud = 'La longitud debe estar entre -180 y 180.';
  const optional = {};
  for (const field of ['puntoEntrega', 'rasgosPrivados']) {
    if (data[field] !== undefined && (typeof data[field] !== 'string' || [...data[field]].length > HALLAZGO_TEXT_MAX)) errors[field] = 'Debe ser un texto de hasta 2000 caracteres.';
    optional[field] = typeof data[field] === 'string' ? data[field].trim() : '';
  }
  return { errors, value: { categoriaId, descripcion, fechaHallazgo, latitud: data.latitud, longitud: data.longitud, ...optional } };
}

/** Decodifica y vuelve a codificar: no confiar solo en extensión o MIME declarado. */
export async function validateHallazgoImages(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > HALLAZGO_MAX_IMAGES) {
    return { error: 'Adjunta entre 1 y 5 imágenes JPG o PNG.' };
  }
  const images = [];
  for (const file of files) {
    if (!Buffer.isBuffer(file.buffer) || !file.buffer.length || file.buffer.length > HALLAZGO_MAX_IMAGE_BYTES) return { error: 'Cada imagen debe ocupar como máximo 5 MiB y no estar vacía.' };
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) return { error: 'Solo se admiten imágenes JPG y PNG.' };
    try {
      const image = sharp(file.buffer, { failOn: 'warning', limitInputPixels: 16_000_000 });
      const metadata = await image.metadata();
      const mime = { jpeg: 'image/jpeg', png: 'image/png' }[metadata.format];
      if (!mime || mime !== file.mimetype || (metadata.pages ?? 1) !== 1) return { error: 'La imagen no coincide con el formato JPG/PNG declarado o contiene varias páginas.' };
      // Se retiran metadatos (incluido GPS EXIF) y nunca se utiliza el nombre del cliente.
      const buffer = await image.rotate().toBuffer();
      if (buffer.length > HALLAZGO_MAX_IMAGE_BYTES) return { error: 'La imagen procesada supera los 5 MiB.' };
      images.push({ buffer, mime, extension: metadata.format === 'jpeg' ? 'jpg' : 'png' });
    } catch { return { error: 'Imagen dañada, no válida o demasiado grande en píxeles (máximo 16 megapíxeles).' }; }
  }
  return { images };
}
