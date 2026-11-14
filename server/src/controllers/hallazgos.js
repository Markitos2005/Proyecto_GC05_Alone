import multer from 'multer';
import { HallazgoError } from '../services/hallazgos.js';
import { HALLAZGO_MAX_IMAGES, HALLAZGO_MAX_IMAGE_BYTES } from '../validation/hallazgos.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: HALLAZGO_MAX_IMAGES, fileSize: HALLAZGO_MAX_IMAGE_BYTES, fields: 1, fieldSize: 32768, parts: 7 },
}).array('imagenes', HALLAZGO_MAX_IMAGES);

/** Se ejecuta DESPUÉS de requireAuth, antes de procesar imágenes. */
export function requireConserje(req, res, next) {
  if (req.user?.rol !== 'CONSERJE') return res.status(403).json({ message: 'Solo Conserjería puede publicar hallazgos.' });
  return next();
}

export function receiveHallazgo(req, res, next) {
  if (!req.is('multipart/form-data')) return res.status(415).json({ message: 'Envía un formulario multipart con datos e imagenes.' });
  upload(req, res, error => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      return next(new HallazgoError(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400,
        error.code === 'LIMIT_FILE_SIZE' ? 'Cada imagen debe ocupar como máximo 5 MiB.' : 'Adjunta entre 1 y 5 imágenes y un único campo datos.', { imagenes: 'Revisa los archivos y los límites del formulario.' }));
    }
    return next(new HallazgoError(400, 'El formulario de imágenes no es válido.'));
  });
}

export function hallazgoController(service) {
  return {
    options: async (req, res, next) => {
      try { return res.json(await service.options(req.user.id)); } catch (error) { return next(error); }
    },
    publish: async (req, res, next) => {
      try {
        if (typeof req.body?.datos !== 'string' || Object.keys(req.body).some(key => key !== 'datos')) {
          throw new HallazgoError(400, 'Incluye únicamente el campo datos con un objeto JSON.');
        }
        let data;
        try { data = JSON.parse(req.body.datos); } catch { throw new HallazgoError(400, 'El campo datos no contiene JSON válido.'); }
        return res.status(201).json(await service.publish(req.user.id, data, req.files));
      } catch (error) { return next(error); }
    },
  };
}
