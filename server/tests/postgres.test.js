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
    await client.query(await readFile(new URL('../db/migrations/001-usuarios.sql', import.meta.url), 'utf8'));
    const app = createApp({ users: createUserRepository(client), registrationLimit: 100 });
    const data = { email: ' Postgres@EXAMPLE.org ', password: 'Prueba1234' };
    const result = await request(app).post('/api/auth/register').send(data);
    assert.equal(result.status, 201);
    const { rows } = await client.query('SELECT * FROM usuarios');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, 'postgres@example.org');
    assert.equal(rows[0].rol, 'USUARIO');
    assert.equal(rows[0].activo, true);
    assert.ok(rows[0].created_at);
    assert.ok(rows[0].updated_at);
    assert.match(rows[0].password_hash, /^\$argon2id\$/);
    assert.ok(await argon2.verify(rows[0].password_hash, data.password));
    assert.equal(result.body.user.password_hash, undefined);
    assert.equal((await request(app).post('/api/auth/register').send(data)).status, 409);
    const simultaneous = { email: 'simultaneo@example.com', password: 'Prueba1234' };
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
