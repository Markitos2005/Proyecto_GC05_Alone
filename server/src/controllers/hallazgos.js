import multer from 'multer';
import { HallazgoError } from '../services/hallazgos.js';
import { HALLAZGO_MAX_IMAGES, HALLAZGO_MAX_IMAGE_BYTES } from '../validation/hallazgos.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: HALLAZGO_MAX_IMAGES, fileSize: HALLAZGO_MAX_IMAGE_BYTES, fields: 1, fieldSize: 32768, parts: 7 },
}).array('imagenes', HALLAZGO_MAX_IMAGES);

/** Sin usar por ahora: US-008 permite publicar a cualquier usuario autenticado.
 * Se reutilizará si la publicación vuelve a reservarse a Conserjería (US-025). */
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
    listOwn: async (req, res, next) => {
      try { return res.json(await service.listOwn(req.user.id)); } catch (error) { return next(error); }
    },
    getOwn: async (req, res, next) => {
      try {
        const result = await service.getOwn(req.user.id, req.params.id);
        return res.status(200).json(result);
      } catch (error) {
        return next(error);
      }
    },
    getOwnImage: async (req, res, next) => {
      try {
        const imagen = await service.getOwnImage(
          req.user.id,
          req.params.id,
          req.params.imagenId,
        );

        res.set('Content-Type', imagen.mime);
        res.set('Cache-Control', 'private, no-store');
        res.set('X-Content-Type-Options', 'nosniff');

        return res.status(200).send(imagen.datos);
      } catch (error) {
        return next(error);
      }
    },
    getOwnHistory: async (req, res, next) => {
      try {
        const result = await service.getOwnHistory(
          req.user.id,
          req.params.id,
        );

        return res.status(200).json(result);
      } catch (error) {
        return next(error);
      }
    },
    updateOwn: async (req, res, next) => {
      try {
        const result = await service.updateOwn(req.user.id, req.params.id, req.body);
        return res.status(200).json(result);
      } catch (error) {
        return next(error);
      }
    },
    changeOwnState: async (req, res, next) => {
      try {
        const result = await service.changeOwnState(
          req.user.id,
          req.params.id,
          req.body,
        );

        return res.status(200).json(result);
      } catch (error) {
        return next(error);
      }
    },
    options: async (req, res, next) => {
      try { return res.json(await service.options(req.user.id)); } catch (error) { return next(error); }
    },
    search: async (req, res, next) => {
      try { return res.json(await service.search(req.query)); } catch (error) { return next(error); }
    },
    image: async (req, res, next) => {
      try {
        const image = await service.image(req.params.id, req.params.posicion);
        // Solo JPG/PNG ya verificados al publicar; caché breve y privada porque el hallazgo puede retirarse.
        res.set({ 'Content-Type': image.mime, 'Cache-Control': 'private, max-age=300', 'Content-Disposition': 'inline' });
        return res.send(image.datos);
      } catch (error) { return next(error); }
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
