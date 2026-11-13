import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import request from 'supertest';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';
import { createUserRepository } from '../src/repositories/users.js';
import { createRecoveryTokenRepository } from '../src/repositories/recoveryTokens.js';
import { createRecoveryTokens } from '../src/services/recoveryTokens.js';
import { createRecoveryService, RECOVERY_CONFIRMATION } from '../src/services/recovery.js';
import { createRecoveryMailer } from '../src/services/recoveryMail.js';
import { createSessionMiddleware } from '../src/security/sessions.js';
import { hashPassword } from '../src/security/passwords.js';
import { testMailbox } from './helpers/smtp.js';

test('SCRUM-43: recuperación HTTP, SMTP local y sesiones PostgreSQL reales', async () => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura una base independiente de pruebas.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const schema = `recovery_api_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  const mailbox = await testMailbox();
  const email = 'persona@example.com';
  const password = 'Prueba1234';
  const id = randomUUID();
  try {
    for (const name of ['001-usuarios.sql', '002-sesiones.sql', '003-perfil.sql', '004-recuperacion.sql']) {
      await pool.query(await readFile(new URL(`../db/migrations/${name}`, import.meta.url), 'utf8'));
    }
    await pool.query('INSERT INTO usuarios (id,email,password_hash,nombre,apellidos) VALUES ($1,$2,$3,$4,$5)', [id, email, await hashPassword(password), 'Persona', 'Ficticia']);
    const app = createApp({
      users: createUserRepository(pool),
      sessionMiddleware: createSessionMiddleware(pool, 'secreto-ficticio-de-pruebas-de-mas-de-32-caracteres'),
      recovery: createRecoveryService({
        tokens: createRecoveryTokens(createRecoveryTokenRepository(pool)),
        sendRecovery: createRecoveryMailer({ port: mailbox.port }),
      }),
      recoveryLimit: 100, loginLimit: 100,
    });
    const agent1 = request.agent(app);
    const agent2 = request.agent(app);
    for (const agent of [agent1, agent2]) {
      assert.equal((await agent.post('/api/auth/login').send({ email, password })).status, 200);
      assert.equal((await agent.get('/api/profile/me')).status, 200);
    }
    const ask = async (address = email) => {
      const response = await request(app).post('/api/auth/forgot-password').send({ email: address });
      assert.equal(response.status, 200);
      assert.deepEqual(response.body, { message: RECOVERY_CONFIRMATION });
      return mailbox.messages.at(-1)?.match(/token=([a-f0-9]{64})/)?.[1];
    };
    const reset = (token, newPassword = 'Nueva1234') => request(app).post('/api/auth/reset-password')
      .send({ token, password: newPassword, confirmPassword: newPassword });
    const first = await ask();
    assert.ok(first, 'El correo SMTP debe contener el enlace');
    assert.match(mailbox.messages[0], /localhost:5173\/#restablecer-contrasena/);
    assert.equal(mailbox.messages[0].includes(password), false);
    const current = await ask();
    assert.equal((await reset(first)).status, 400);
    assert.equal((await reset('0'.repeat(64))).status, 400);
    // Una contraseña débil no consume el enlace correcto.
    assert.equal((await reset(current, 'debil')).status, 400);
    assert.equal((await reset(current)).status, 200);
    assert.equal((await reset(current)).status, 400);
    const { rows: [user] } = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [id]);
    assert.match(user.password_hash, /^\$argon2id\$/);
    assert.equal(await argon2.verify(user.password_hash, 'Nueva1234'), true);
    assert.equal(await argon2.verify(user.password_hash, password), false);
    for (const agent of [agent1, agent2]) assert.equal((await agent.get('/api/profile/me')).status, 401);
    assert.equal((await request(app).post('/api/auth/login').send({ email, password })).status, 401);
    assert.equal((await request(app).post('/api/auth/login').send({ email, password: 'Nueva1234' })).status, 200);
    const expired = await ask();
    await pool.query('UPDATE recuperacion_tokens SET expires_at = clock_timestamp()');
    assert.equal((await reset(expired)).status, 400);
    await ask(); // Cuarta solicitud: misma respuesta, ningún nuevo correo.
    assert.equal(mailbox.messages.length, 3);
    await ask('inexistente@example.com');
    assert.equal(mailbox.messages.length, 3);
    await pool.query('DELETE FROM recuperacion_solicitudes');
    await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);
    await ask();
    assert.equal(mailbox.messages.length, 3);
    await pool.query('UPDATE usuarios SET activo = true, password_hash = NULL WHERE id = $1', [id]);
    await ask();
    assert.equal(mailbox.messages.length, 3);
  } finally {
    await mailbox.close();
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
