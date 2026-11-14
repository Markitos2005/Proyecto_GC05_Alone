import { randomUUID } from 'node:crypto';
import pg from 'pg';

// SOLO DESARROLLO. Facultades y categorías iniciales para probar la publicación de hallazgos
// (US-008) hasta que US-023 permita administrarlas. Se ejecuta a mano: npm run db:seed-dev.
// Idempotente: no duplica ni modifica las que ya existan.
if (process.env.NODE_ENV === 'production') {
  throw new Error('db:seed-dev no se ejecuta en producción.');
}
if (!process.env.DATABASE_URL) {
  throw new Error('Configura DATABASE_URL en .env');
}

const facultades = [
  'Escuela Politécnica (Cáceres)',
  'Facultad de Ciencias (Badajoz)',
  'Facultad de Filosofía y Letras (Cáceres)',
  'Escuela de Ingenierías Industriales (Badajoz)',
];

const categorias = [
  'Electrónica',
  'Documentación y tarjetas',
  'Llaves',
  'Mochilas y bolsos',
  'Ropa y accesorios',
  'Material académico',
  'Otros',
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  for (const [table, names] of [['facultades', facultades], ['categorias', categorias]]) {
    let created = 0;
    for (const nombre of names) {
      const { rowCount } = await pool.query(
        `INSERT INTO ${table} (id, nombre) VALUES ($1, $2) ON CONFLICT (nombre) DO NOTHING`,
        [randomUUID(), nombre],
      );
      created += rowCount;
    }
    console.log(`${table}: ${created} nuevas, ${names.length - created} ya existían.`);
  }
} catch {
  console.error('No se pudieron cargar los datos de desarrollo. Ejecuta antes npm run db:migrate.');
  process.exitCode = 1;
} finally {
  await pool.end();
}
