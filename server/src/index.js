import pg from 'pg';
import { createApp } from './app.js';
import { createUserRepository } from './repositories/users.js';
import { createSessionMiddleware } from './security/sessions.js';
import { createRecoveryTokenRepository } from './repositories/recoveryTokens.js';
import { createRecoveryTokens } from './services/recoveryTokens.js';
import { createRecoveryService } from './services/recovery.js';
import { createRecoveryMailer } from './services/recoveryMail.js';
import { createHallazgoRepository } from './repositories/hallazgos.js';

if (!process.env.DATABASE_URL) {
  throw new Error('Configura DATABASE_URL en .env');
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', () => {
  console.error('Conexión de base de datos interrumpida.');
});

const sessionMiddleware = createSessionMiddleware(
  pool,
  process.env.SESSION_SECRET,
);

const app = createApp({
  users: createUserRepository(pool),
  sessionMiddleware,
  // Raúl/SCRUM-105: completar este repositorio; rutas y formulario ya usan el contrato.
  hallazgoStorage: createHallazgoRepository(pool),
  recovery: createRecoveryService({
    tokens: createRecoveryTokens(createRecoveryTokenRepository(pool)),
    sendRecovery: createRecoveryMailer({
      port: process.env.SMTP_TEST_PORT ?? 1025,
      appOrigin: process.env.RECOVERY_APP_ORIGIN ?? 'http://localhost:5173',
    }),
    logError: () => console.error('No se pudo entregar el correo de recuperación de pruebas.'),
  }),
});

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT debe ser un puerto válido.');
}

const server = app.listen(port, () => {
  console.log(
    'Aplicación lista en http://localhost:' + server.address().port,
  );
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
