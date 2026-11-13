import { readFile } from 'node:fs/promises';
import pg from 'pg';

if (!process.env.DATABASE_URL) throw new Error('Configura DATABASE_URL en .env');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
try {
  // Migración inicial idempotente; no borra datos existentes.
  const sql = await readFile(new URL('../db/migrations/001-usuarios.sql', import.meta.url), 'utf8');
  await pool.query(sql);
  console.log('Tabla usuarios preparada.');
} catch {
  console.error('No se pudo preparar la base de datos. Revisa su disponibilidad y configuración.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
