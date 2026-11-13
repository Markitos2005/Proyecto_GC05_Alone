import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { createRecoveryTokens } from '../src/services/recoveryTokens.js';
import { createRecoveryTokenRepository } from '../src/repositories/recoveryTokens.js';

test('SCRUM-96: persistencia, límites y consumo atómico en PostgreSQL real', async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const schema = `recovery_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  const service = createRecoveryTokens(createRecoveryTokenRepository(pool));
  const email = 'persona@example.com';
  const id = randomUUID();
  try {
    for (const name of ['001-usuarios.sql', '004-recuperacion.sql', '004-recuperacion.sql']) {
      await pool.query(await readFile(new URL(`../db/migrations/${name}`, import.meta.url), 'utf8'));
    }
    await pool.query('INSERT INTO usuarios (id,email,password_hash) VALUES ($1,$2,$3)', [id, email, 'hash-ficticio']);
    t.beforeEach(async () => {
      await pool.query('DELETE FROM recuperacion_tokens');
      await pool.query('DELETE FROM recuperacion_solicitudes');
      await pool.query('UPDATE usuarios SET activo = true, password_hash = $1 WHERE id = $2', ['hash-ficticio', id]);
    });

    await t.test('persiste solo hash y caduca en 30 minutos; se consume una sola vez', async () => {
      const before = Date.now();
      const issued = await service.issue(email);
      assert.ok(issued.expiresAt.getTime() >= before + 30 * 60 * 1000);
      const { rows: [saved] } = await pool.query('SELECT * FROM recuperacion_tokens');
      assert.notEqual(saved.token_hash, issued.token);
      assert.equal(JSON.stringify(saved).includes(issued.token), false);
      let calls = 0;
      const apply = async (_client, userId) => { assert.equal(userId, id); calls++; };
      assert.equal(await service.consume(issued.token, apply), true);
      assert.equal(await service.consume(issued.token, apply), false);
      assert.equal(calls, 1);
    });
    await t.test('una nueva solicitud invalida el enlace anterior', async () => {
      const old = await service.issue(email);
      const current = await service.issue(email);
      assert.equal(await service.consume(old.token, async () => {}), false);
      assert.equal(await service.consume(current.token, async () => {}), true);
    });
    await t.test('rechaza enlaces caducados o manipulados', async () => {
      const issued = await service.issue(email);
      assert.equal(await service.consume('0'.repeat(64), async () => {}), false);
      await pool.query('UPDATE recuperacion_tokens SET expires_at = clock_timestamp()');
      assert.equal(await service.consume(issued.token, async () => {}), false);
    });
    await t.test('solo admite tres solicitudes por hora incluso con concurrencia', async () => {
      const results = await Promise.all(Array.from({ length: 8 }, () => service.issue(email)));
      assert.equal(results.filter(Boolean).length, 3);
      assert.equal(await service.issue(email), null);
      await pool.query("UPDATE recuperacion_solicitudes SET requested_at = clock_timestamp() - interval '61 minutes'");
      assert.ok(await service.issue(email));
    });
    await t.test('correos inexistentes, inactivos y OAuth no obtienen enlace', async () => {
      for (let i = 0; i < 4; i++) assert.equal(await service.issue('nadie@example.com'), null);
      const { rows: [{ count }] } = await pool.query('SELECT count(*)::int AS count FROM recuperacion_solicitudes');
      assert.equal(count, 3);
      await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);
      assert.equal(await service.issue(email), null);
      await pool.query('UPDATE usuarios SET activo = true, password_hash = NULL WHERE id = $1', [id]);
      assert.equal(await service.issue(email), null);
    });
    await t.test('una cuenta desactivada después de emitir tampoco puede consumir', async () => {
      const issued = await service.issue(email);
      await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);
      assert.equal(await service.consume(issued.token, async () => { assert.fail(); }), false);
    });
    await t.test('dos consumos simultáneos solo ejecutan una operación', async () => {
      const issued = await service.issue(email);
      let calls = 0;
      const results = await Promise.all([1, 2].map(() => service.consume(issued.token, async () => { calls++; })));
      assert.deepEqual(results.sort(), [false, true]);
      assert.equal(calls, 1);
    });
    await t.test('un error revierte tanto el consumo como los cambios del restablecimiento', async () => {
      const issued = await service.issue(email);
      await assert.rejects(service.consume(issued.token, async (client, userId) => {
        await client.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', ['cambio-ficticio', userId]);
        throw new Error('Fallo simulado');
      }), /Fallo simulado/);
      const { rows: [user] } = await pool.query('SELECT password_hash FROM usuarios WHERE id = $1', [id]);
      assert.equal(user.password_hash, 'hash-ficticio');
      assert.equal(await service.consume(issued.token, async () => {}), true);
    });
  } finally {
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
