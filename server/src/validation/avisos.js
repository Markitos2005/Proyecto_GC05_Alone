import validator from 'validator';
import { TELEFONO_PATTERN } from './profile.js';

// Límites técnicos de este contrato, coherentes con hallazgos y perfil.
export const AVISO_TEXT_MAX = 2000;
const FIELDS = new Set(['categoriaId', 'facultadId', 'centroId', 'descripcion',
  'fechaPerdida', 'rasgosPrivados', 'contactoEmail', 'contactoTelefono']);

export function validateAviso(body, now = new Date()) {
  const errors = {};
  const value = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: { aviso: 'Envía el aviso como un objeto JSON.' }, value };
  }
  // No aceptar autor, estado ni campos extra: los datos de identidad los fija el servidor.
  if (Object.keys(body).some(key => !FIELDS.has(key))) {
    errors.aviso = 'El aviso contiene campos no permitidos.';
  }
  for (const key of ['categoriaId', 'facultadId', 'centroId']) {
    const raw = body[key];
    const text = typeof raw === 'string' ? raw.trim() : '';
    value[key] = text.toLowerCase() || null;
    if ((raw !== undefined && raw !== null && typeof raw !== 'string') ||
        (text && !validator.isUUID(text)) || (key === 'categoriaId' && !text)) {
      errors[key] = 'Selecciona una opción válida.';
    }
  }
  if (!value.facultadId && !value.centroId) errors.facultadId = 'Selecciona una facultad o un centro.';
  for (const key of ['descripcion', 'rasgosPrivados']) {
    const raw = body[key];
    const text = typeof raw === 'string' ? raw.trim() : '';
    value[key] = text || null;
    if ((raw !== undefined && raw !== null && typeof raw !== 'string') ||
        (key === 'descripcion' && !text) || [...text].length > AVISO_TEXT_MAX) {
      errors[key] = key === 'descripcion'
        ? `Introduce una descripción de entre 1 y ${AVISO_TEXT_MAX} caracteres.`
        : `Los rasgos privados deben ser un texto de hasta ${AVISO_TEXT_MAX} caracteres.`;
    }
  }
  const date = body.fechaPerdida;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < '0001-01-01' ||
      !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) ||
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date || date > now.toISOString().slice(0, 10)) {
    errors.fechaPerdida = 'Indica una fecha aproximada válida que no sea futura (AAAA-MM-DD).';
  } else value.fechaPerdida = date;
  for (const key of ['contactoEmail', 'contactoTelefono']) {
    const raw = body[key];
    const text = typeof raw === 'string' ? raw.trim() : '';
    value[key] = text || null;
    if (raw !== undefined && raw !== null && typeof raw !== 'string') {
      errors[key] = 'Introduce un texto válido o deja el campo vacío.';
    } else if (text && key === 'contactoEmail' && (text.length > 254 ||
        !validator.isEmail(text, { allow_utf8_local_part: false }))) {
      errors[key] = 'El formato del correo de contacto no es válido.';
    } else if (text && key === 'contactoTelefono' && !TELEFONO_PATTERN.test(text)) {
      errors[key] = 'Introduce 9 cifras, con el prefijo +34 opcional.';
    }
  }
  return { errors, value };
}
