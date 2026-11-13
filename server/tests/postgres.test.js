import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import request from 'supertest';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';
import { createUserRepository } from '../src/repositories/users.js';

test('Registro HTTP con persistencia y unicidad reales en PostgreSQL', async () => {
  // Fallar explícitamente si no hay BD de pruebas: nunca usar DATABASE_URL como alternativa.
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL con una base de datos de pruebas independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL, 'La base de pruebas debe ser independiente.');
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = `registro_test_${randomUUID().replaceAll('-', '')}`;
  const client = await pool.connect();
  try {
    // Esquema aleatorio aislado: nunca truncar ni borrar tablas de otras personas.
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
    for (const migration of ['001-usuarios.sql', '003-perfil.sql']) {
      await client.query(await readFile(new URL(`../db/migrations/${migration}`, import.meta.url), 'utf8'));
    }
    const app = createApp({ users: createUserRepository(client), registrationLimit: 100 });
    const data = { nombre: ' Persona ', apellidos: 'Postgres Ficticia', email: ' Postgres@EXAMPLE.org ', password: 'Prueba1234' };
    const result = await request(app).post('/api/auth/register').send(data);
    assert.equal(result.status, 201);
    const { rows } = await client.query('SELECT * FROM usuarios');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, 'postgres@example.org');
    assert.equal(rows[0].rol, 'USUARIO');
    assert.equal(rows[0].activo, true);
    assert.equal(rows[0].nombre, 'Persona');
    assert.equal(rows[0].apellidos, 'Postgres Ficticia');
    assert.equal(rows[0].telefono, null);
    assert.ok(rows[0].created_at);
    assert.ok(rows[0].updated_at);
    assert.match(rows[0].password_hash, /^\$argon2id\$/);
    assert.ok(await argon2.verify(rows[0].password_hash, data.password));
    assert.equal(result.body.user.password_hash, undefined);
    assert.equal((await request(app).post('/api/auth/register').send(data)).status, 409);
    const simultaneous = { ...data, email: 'simultaneo@example.com' };
    const responses = await Promise.all([request(app).post('/api/auth/register').send(simultaneous), request(app).post('/api/auth/register').send(simultaneous)]);
    assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
    // También comprobar directamente la restricción, sin la consulta previa del servicio.
    await assert.rejects(client.query(
      'INSERT INTO usuarios (id, email, password_hash) VALUES ($1, $2, $3)',
      [randomUUID(), rows[0].email, rows[0].password_hash],
    ), { code: '23505' });
  } finally {
    await client.query('SET search_path TO public');
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    client.release();
    await pool.end();
  }
});

test('US-006: cambio de contraseña atómico con registro y cierre de las demás sesiones', async () => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL con una base de datos de pruebas independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL, 'La base de pruebas debe ser independiente.');
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = `password_test_${randomUUID().replaceAll('-', '')}`;
  const client = await pool.connect();
  try {
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
    for (const migration of ['001-usuarios.sql', '002-sesiones.sql', '003-perfil.sql', '004-cambios-contrasena.sql', '005-bloqueo-contrasena.sql']) {
      await client.query(await readFile(new URL(`../db/migrations/${migration}`, import.meta.url), 'utf8'));
    }
    const users = createUserRepository(client);
    const ana = randomUUID();
    const beto = randomUUID();
    const oldHash = await argon2.hash('Prueba1234', { type: argon2.argon2id });
    for (const [id, email] of [[ana, 'ana@example.com'], [beto, 'beto@example.com']]) {
      await client.query('INSERT INTO usuarios (id, email, password_hash) VALUES ($1, $2, $3)', [id, email, oldHash]);
    }
    const insertSession = (sid, userId) => client.query(
      `INSERT INTO sesiones (sid, sess, expire) VALUES ($1, $2, now() + interval '1 day')`,
      [sid, JSON.stringify({ cookie: {}, userId, rol: 'USUARIO' })],
    );
    await insertSession('ana-actual', ana);
    await insertSession('ana-movil', ana);
    await insertSession('ana-portatil', ana);
    await insertSession('beto-unica', beto);

    // SCRUM-99 (AC-07): fallos consecutivos por cuenta y bloqueo calculado con la hora de la BD.
    const limits = { maxAttempts: 3, lockSeconds: 900 };
    assert.deepEqual(await users.registerFailedPasswordAttempt(ana, limits), { bloqueada: false });
    assert.deepEqual(await users.registerFailedPasswordAttempt(ana, limits), { bloqueada: false });
    assert.equal((await users.findCredentialsById(ana)).intentos_contrasena_fallidos, 2);
    await users.resetFailedPasswordAttempts(ana);
    assert.equal((await users.findCredentialsById(ana)).intentos_contrasena_fallidos, 0);
    for (let attempt = 1; attempt <= 2; attempt += 1) await users.registerFailedPasswordAttempt(ana, limits);
    assert.deepEqual(await users.registerFailedPasswordAttempt(ana, limits), { bloqueada: true });
    const lockedAccount = await users.findCredentialsById(ana);
    assert.equal(lockedAccount.bloqueada, true);
    assert.equal(lockedAccount.intentos_contrasena_fallidos, 0);
    assert.equal((await users.findCredentialsById(beto)).bloqueada, false);
    // Un bloqueo vencido deja de aplicarse.
    await client.query(`UPDATE usuarios SET contrasena_bloqueada_hasta = now() - interval '1 second' WHERE id = $1`, [beto]);
    assert.equal((await users.findCredentialsById(beto)).bloqueada, false);

    const newHash = await argon2.hash('Distinta5678', { type: argon2.argon2id });
    const result = await users.changePassword({ id: ana, passwordHash: newHash, keepSessionId: 'ana-actual' });
    assert.deepEqual(result, { sesionesCerradas: 2 });
    // El cambio correcto también levanta el bloqueo y reinicia el contador.
    const afterChange = await users.findCredentialsById(ana);
    assert.equal(afterChange.bloqueada, false);
    assert.equal(afterChange.intentos_contrasena_fallidos, 0);

    const { rows: [stored] } = await client.query('SELECT password_hash FROM usuarios WHERE id = $1', [ana]);
    assert.ok(await argon2.verify(stored.password_hash, 'Distinta5678'));

    const { rows: sesiones } = await client.query('SELECT sid FROM sesiones ORDER BY sid');
    assert.deepEqual(sesiones.map((row) => row.sid), ['ana-actual', 'beto-unica']);

    const { rows: registro } = await client.query('SELECT * FROM cambios_contrasena');
    assert.equal(registro.length, 1);
    assert.equal(registro[0].usuario_id, ana);
    assert.ok(registro[0].created_at);
    // El registro nunca guarda contraseñas ni hashes.
    assert.deepEqual(Object.keys(registro[0]).sort(), ['created_at', 'id', 'usuario_id']);

    // Cuenta inexistente: no cambia nada, no registra ni cierra sesiones.
    assert.equal(await users.changePassword({ id: randomUUID(), passwordHash: newHash, keepSessionId: 'x' }), null);
    assert.equal((await client.query('SELECT count(*)::int AS n FROM cambios_contrasena')).rows[0].n, 1);
    assert.equal((await client.query('SELECT count(*)::int AS n FROM sesiones')).rows[0].n, 2);
  } finally {
    await client.query('SET search_path TO public');
    await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    client.release();
    await pool.end();
  }
});
