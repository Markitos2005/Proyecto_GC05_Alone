import pg from 'pg';
import { createApp } from './app.js';
import { createUserRepository } from './repositories/users.js';

if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en .env');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
pool.on('error', () => console.error('Conexión de base de datos interrumpida.'));
const app = createApp({ users: createUserRepository(pool) });
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT debe ser un puerto válido.');
const server = app.listen(port, () => console.log('Aplicación lista en http://localhost:' + server.address().port));
async function shutdown() {
  server.close(async () => { await pool.end(); process.exit(0); });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
