import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { logoutController } from './controllers/logout.js';


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

import { createProfileService, ProfileError } from './services/profile.js';
import { profileController } from './controllers/profile.js';
import { requireAuth } from './security/auth.js';
import { RecoveryError } from './services/recovery.js';
import { recoveryController } from './controllers/recovery.js';

/** App independiente del puerto y de la conexión a PostgreSQL. */
export function createApp({
  users,
  sessionMiddleware,
  recovery,
  recoveryLimit = 30,
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

  // Protección CSRF mediante lista de orígenes permitidos.
  function requireSameOrigin(req, res, next) {
    const origin = req.get('Origin');
    const fetchSite = req.get('Sec-Fetch-Site');

    const reject = () =>
      res.status(403).json({
        message: 'Origen de la petición no permitido.',
      });

    // Nunca permitir peticiones cross-site.
    if (fetchSite === 'cross-site') {
      return reject();
    }

    // Orígenes expresamente autorizados.
    const allowedOrigins = new Set([
      `${req.protocol}://${req.get('host')}`,
      ...(process.env.NODE_ENV !== 'production'
        ? ['http://localhost:5173']
        : []),
      ...(process.env.APP_ORIGIN
        ? [process.env.APP_ORIGIN]
        : []),
    ]);

    if (origin) {
      if (!allowedOrigins.has(origin)) {
        return reject();
      }

      return next();
    }

    // Sin Origin, exigir same-origin.
    if (fetchSite === 'same-origin') {
      return next();
    }

    return reject();
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


  // Perfil del usuario autenticado: US-005.
  const profile = profileController(createProfileService(users));
  const authenticated = requireAuth(users);

  app.get('/api/profile/me', authenticated, profile.get);

  app.patch(
    '/api/profile/me',
    authenticated,
    requireJson,
    express.json({ limit: '16kb', strict: true }),
    profile.update,
  );

  // Cierre de sesión: SCRUM-39 / US-003.
  app.post(
    '/api/auth/logout',
    requireSameOrigin,
    (req, res, next) => {
      if (!req.session) {
        return res.status(503).json({
          message: 'El servicio de autenticación no está disponible.',
        });
      }

      next();
    },
    logoutController(),
  );

  // El límite por correo (3/h) lo aplica SCRUM-96 en PostgreSQL. Este limita abuso por IP.
  const recoveryRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, limit: recoveryLimit,
    standardHeaders: 'draft-7', legacyHeaders: false,
    message: { message: 'Demasiados intentos. Inténtalo más tarde.' },
  });
  for (const [path, action] of [['forgot-password', 'request'], ['reset-password', 'reset']]) {
    app.post(`/api/auth/${path}`, recoveryRateLimit, requireJson,
      express.json({ limit: '16kb', strict: true }), recoveryController(recovery, action));
  }

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
  app.use((error, req, res, _next) => {
    if (
      error instanceof RegistrationError ||
      error instanceof LoginError ||
      error instanceof ProfileError ||
      error instanceof RecoveryError
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
      message: req.path === '/api/auth/register'
        ? 'No se ha podido completar el registro.'
        : 'No se ha podido completar la operación.',
    });
  });

  return app;
}
