import sharp from 'sharp';
import validator from 'validator';

// Jira SCRUM-105: 1–5 imágenes JPG/PNG de hasta 5 MiB cada una.
export const HALLAZGO_MAX_IMAGES = 5;
export const HALLAZGO_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Límites técnicos del contrato de esta API, no nuevas estimaciones ni requisitos del profesor.
export const HALLAZGO_TEXT_MAX = 2000;
const allowedFields = ['facultadId', 'categoriaId', 'descripcion', 'fechaHallazgo', 'latitud', 'longitud', 'puntoEntrega', 'rasgosPrivados'];

export function validateHallazgo(data, today = new Date().toISOString().slice(0, 10)) {
  const errors = {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { errors: { datos: 'Envía un objeto JSON en el campo datos.' } };
  if (Object.keys(data).some(key => !allowedFields.includes(key))) errors.datos = 'Hay campos no permitidos. El autor y el estado los decide el servidor.';
  // US-008: cualquier usuario autenticado publica y elige la facultad donde entrega el objeto.
  const facultadId = typeof data.facultadId === 'string' ? data.facultadId : '';
  if (!validator.isUUID(facultadId)) errors.facultadId = 'Selecciona una facultad válida.';
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
  return { errors, value: { facultadId, categoriaId, descripcion, fechaHallazgo, latitud: data.latitud, longitud: data.longitud, ...optional } };
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

// SCRUM-107 / US-009: búsqueda paginada de hallazgos Activos.
export const BUSQUEDA_TAMANO_DEFECTO = 12;
export const BUSQUEDA_TAMANO_MAX = 50;
export const BUSQUEDA_TEXTO_MAX = 100;
const busquedaFields = ['q', 'categoriaId', 'facultadId', 'fechaDesde', 'fechaHasta', 'pagina', 'tamano', 'corte'];

function isDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === text;
}

function positiveInt(text, max) {
  if (!/^\d{1,6}$/.test(text)) return null;
  const number = Number(text);
  return number >= 1 && number <= max ? number : null;
}

/** Valida la query string. Todos los filtros son opcionales; un parámetro repetido o desconocido es un error. */
export function validateBusqueda(query) {
  const errors = {};
  const raw = query && typeof query === 'object' ? query : {};
  if (Object.keys(raw).some(key => !busquedaFields.includes(key))) errors.parametros = `Solo se admiten: ${busquedaFields.join(', ')}.`;
  const text = (name) => {
    const value = raw[name];
    if (value === undefined) return '';
    if (typeof value !== 'string') { errors[name] = 'Indica este filtro una sola vez.'; return ''; }
    return value.trim();
  };

  const q = text('q').replace(/\s+/g, ' ');
  if ([...q].length > BUSQUEDA_TEXTO_MAX) errors.q = `El texto de búsqueda no puede superar los ${BUSQUEDA_TEXTO_MAX} caracteres.`;
  const categoriaId = text('categoriaId');
  if (categoriaId && !validator.isUUID(categoriaId)) errors.categoriaId = 'Selecciona una categoría válida.';
  const facultadId = text('facultadId');
  if (facultadId && !validator.isUUID(facultadId)) errors.facultadId = 'Selecciona una facultad válida.';
  const fechaDesde = text('fechaDesde');
  if (fechaDesde && !isDate(fechaDesde)) errors.fechaDesde = 'Indica una fecha existente (AAAA-MM-DD).';
  const fechaHasta = text('fechaHasta');
  if (fechaHasta && !isDate(fechaHasta)) errors.fechaHasta = 'Indica una fecha existente (AAAA-MM-DD).';
  if (fechaDesde && fechaHasta && !errors.fechaDesde && !errors.fechaHasta && fechaDesde > fechaHasta) {
    errors.fechaHasta = 'La fecha final no puede ser anterior a la inicial.';
  }
  const paginaText = text('pagina');
  const pagina = paginaText ? positiveInt(paginaText, 100000) : 1;
  if (pagina === null) errors.pagina = 'La página debe ser un número entero mayor que 0.';
  const tamanoText = text('tamano');
  const tamano = tamanoText ? positiveInt(tamanoText, BUSQUEDA_TAMANO_MAX) : BUSQUEDA_TAMANO_DEFECTO;
  if (tamano === null) errors.tamano = `El tamaño de página debe estar entre 1 y ${BUSQUEDA_TAMANO_MAX}.`;
  // corte: instante devuelto por la primera página. Fija el listado para que, al pasar de página,
  // los hallazgos publicados después no desplacen resultados (US-009-AC-02).
  const corte = text('corte');
  if (corte && (!validator.isISO8601(corte, { strict: true }) || !Number.isFinite(Date.parse(corte)))) {
    errors.corte = 'El corte de la búsqueda no es válido. Vuelve a la primera página.';
  }

  return {
    errors,
    value: {
      terminos: q ? q.split(' ').slice(0, 10) : [],
      q, categoriaId, facultadId, fechaDesde, fechaHasta, pagina, tamano, corte,
    },
  };
}

export function validateImagenRef(id, posicion) {
  return validator.isUUID(String(id ?? '')) && /^[1-5]$/.test(String(posicion ?? ''));
}
