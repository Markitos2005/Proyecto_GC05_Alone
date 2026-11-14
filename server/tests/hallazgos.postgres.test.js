import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { createUserRepository } from '../src/repositories/users.js';
import { createSessionMiddleware } from '../src/security/sessions.js';
import { hashPassword } from '../src/security/passwords.js';

test('SCRUM-49: permisos con usuario y sesiones PostgreSQL reales; almacenamiento SCRUM-105 simulado explícitamente', async () => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const schema = `hallazgo_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  try {
    for (const name of ['001-usuarios.sql', '002-sesiones.sql', '003-perfil.sql']) {
      await pool.query(await readFile(new URL(`../db/migrations/${name}`, import.meta.url), 'utf8'));
    }
    const id = randomUUID(), category = randomUUID(), faculty = randomUUID();
    await pool.query('INSERT INTO usuarios (id,email,password_hash,nombre,apellidos,rol) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, 'conserje@example.com', await hashPassword('Prueba1234'), 'Conserje', 'Ficticio', 'CONSERJE']);
    let saved;
    // Solo fixture de contrato: NO afirma persistencia de hallazgos/fotos ni crea su esquema.
    const storage = {
      getPublicationContext: async userId => {
        assert.equal(userId, id);
        return { facultad: { id: faculty, activo: true }, categorias: [{ id: category, activo: true }] };
      },
      publish: async input => { saved = input; return { id: randomUUID() }; },
    };
    const settings = { users: createUserRepository(pool), sessionMiddleware: createSessionMiddleware(pool, 'secreto-ficticio-de-pruebas-hallazgos-mas-de-32') };
    const app = createApp({ ...settings, hallazgoStorage: storage });
    const agent = request.agent(app);
    assert.equal((await agent.post('/api/auth/login').send({ email: 'conserje@example.com', password: 'Prueba1234' })).status, 200);
    assert.equal((await agent.get('/api/hallazgos/opciones')).status, 200);
    const photo = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'blue' } }).png().toBuffer();
    const result = await agent.post('/api/hallazgos').set('Origin', 'http://localhost:5173')
      .field('datos', JSON.stringify({ categoriaId: category, descripcion: 'Objeto ficticio', fechaHallazgo: '2026-01-01', latitud: 0, longitud: 0, rasgosPrivados: 'Rasgo secreto ficticio' }))
      .attach('imagenes', photo, { filename: 'foto.png', contentType: 'image/png' });
    assert.equal(result.status, 201);
    assert.equal(saved.autorId, id);
    assert.equal(saved.facultadId, faculty);
    assert.equal(saved.estado, 'Activo');
    assert.equal(JSON.stringify(result.body).includes('Rasgo secreto'), false);
    // Un cambio de rol en BD debe surtir efecto sin regenerar la cookie.
    await pool.query("UPDATE usuarios SET rol = 'USUARIO' WHERE id = $1", [id]);
    assert.equal((await agent.get('/api/hallazgos/opciones')).status, 403);
    await pool.query("UPDATE usuarios SET rol = 'CONSERJE', activo = false WHERE id = $1", [id]);
    assert.equal((await agent.get('/api/hallazgos/opciones')).status, 401);
    // Arranque real sin conectar SCRUM-105: respuesta explícita, nunca éxito simulado.
    await pool.query('UPDATE usuarios SET activo = true WHERE id = $1', [id]);
    const pending = request.agent(createApp(settings));
    await pending.post('/api/auth/login').send({ email: 'conserje@example.com', password: 'Prueba1234' });
    assert.equal((await pending.get('/api/hallazgos/opciones')).status, 503);
  } finally {
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
