import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { createRegistrationService, RegistrationError } from './services/register.js';
import { registrationController } from './controllers/register.js';

/** App independiente del puerto y la conexión: permite probar el contrato HTTP. */
export function createApp({ users, registrationLimit = 20, logError = () => console.error('Error interno de registro.') }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.post('/api/auth/register', rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: registrationLimit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { message: 'Demasiados intentos. Inténtalo más tarde.' },
  }), (req, res, next) => {
    if (!req.is('application/json')) return res.status(415).json({ message: 'Envía los datos en formato JSON.' });
    next();
  }, express.json({ limit: '16kb', strict: true }), registrationController(createRegistrationService(users)));
  app.use('/api', (_req, res) => res.status(404).json({ message: 'Recurso no encontrado.' }));
  // En producción Express sirve el React compilado: un único proceso y origen.
  app.use(express.static(fileURLToPath(new URL('../../client/dist/', import.meta.url))));
  app.use((_req, res) => res.status(404).send('Recurso no encontrado.'));
  app.use((error, _req, res, _next) => {
    if (error instanceof RegistrationError) {
      return res.status(error.status).json({ message: error.message, ...(error.errors ? { errors: error.errors } : {}) });
    }
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'El JSON no es válido.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'La petición es demasiado grande.' });
    // No pasar error, body, URL de conexión ni credenciales al logger.
    logError();
    res.status(500).json({ message: 'No se ha podido completar el registro.' });
  });
  return app;
}
