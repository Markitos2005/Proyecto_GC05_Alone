import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';

import {
  createRegistrationService,
  RegistrationError,
} from './services/register.js';
import { registrationController } from './controllers/register.js';

import {
  createLoginService,
  LoginError,
} from './services/login.js';
import { loginController } from './controllers/login.js';

/** App independiente del puerto y de la conexión a PostgreSQL. */
export function createApp({
  users,
  sessionMiddleware,
  registrationLimit = 20,
  loginLimit = 10,
  logError = () => console.error('Error interno de la aplicación.'),
}) {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  // Evitar el almacenamiento en caché de respuestas privadas.
  app.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  // Aplicar las sesiones cuando se haya configurado el middleware.
  if (sessionMiddleware) {
    app.use('/api', sessionMiddleware);
  }

  // Comprobar el formato de las peticiones JSON.
  function requireJson(req, res, next) {
    if (!req.is('application/json')) {
      return res.status(415).json({
        message: 'Envía los datos en formato JSON.',
      });
    }

    next();
  }

  // Registro de usuarios: conservar la funcionalidad de Marcos.
  app.post(
    '/api/auth/register',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: registrationLimit,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        message: 'Demasiados intentos. Inténtalo más tarde.',
      },
    }),
    requireJson,
    express.json({ limit: '16kb', strict: true }),
    registrationController(createRegistrationService(users)),
  );

  // Inicio de sesión: SCRUM-38.
  app.post(
    '/api/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: loginLimit,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        message: 'Demasiados intentos. Inténtalo más tarde.',
      },
    }),
    requireJson,
    express.json({ limit: '16kb', strict: true }),
    (req, res, next) => {
      if (!req.session) {
        return res.status(503).json({
          message: 'El servicio de autenticación no está disponible.',
        });
      }

      next();
    },
    loginController(createLoginService(users)),
  );

  app.use('/api', (_req, res) => {
    res.status(404).json({
      message: 'Recurso no encontrado.',
    });
  });

  // Servir React compilado en producción.
  app.use(
    express.static(
      fileURLToPath(new URL('../../client/dist/', import.meta.url)),
    ),
  );

  app.use((_req, res) => {
    res.status(404).send('Recurso no encontrado.');
  });

  // Gestión centralizada de errores.
  app.use((error, _req, res, _next) => {
    if (
      error instanceof RegistrationError ||
      error instanceof LoginError
    ) {
      return res.status(error.status).json({
        message: error.message,
        ...(error.errors ? { errors: error.errors } : {}),
      });
    }

    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({
        message: 'El JSON no es válido.',
      });
    }

    if (error.type === 'entity.too.large') {
      return res.status(413).json({
        message: 'La petición es demasiado grande.',
      });
    }

    // Nunca registrar contraseñas, cookies o datos sensibles.
    logError();

    return res.status(500).json({
      message: 'No se ha podido completar el registro.',
    });
  });

  return app;
}