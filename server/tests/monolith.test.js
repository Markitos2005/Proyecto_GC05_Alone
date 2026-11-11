import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { promisify } from 'node:util';
import pg from 'pg';

test('Monolito compilado: arranque real, React, assets y registro HTTP con PostgreSQL', { timeout: 20000 }, async () => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  const schema = `monolith_test_${randomUUID().replaceAll('-', '')}`;
  let child;
  try {
    await pool.query(`CREATE SCHEMA "${schema}"`);
    const env = { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, PORT: '0', PGOPTIONS: `-c search_path=${schema}` };
    // Probar el ejecutable de migración y su repetición sin borrar datos.
    await promisify(execFile)(process.execPath, ['server/scripts/migrate.js'], { env });
    await promisify(execFile)(process.execPath, ['server/scripts/migrate.js'], { env });
    // PGOPTIONS limita al proceso hijo al esquema exclusivo de esta prueba.
    child = spawn(process.execPath, ['server/src/index.js'], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    let port;
    for (let attempt = 0; attempt < 100; attempt++) {
      port = output.match(/localhost:(\d+)/)?.[1];
      if (port) break;
      assert.equal(child.exitCode, null, 'El servidor terminó antes de arrancar.');
      await delay(50);
    }
    assert.ok(port, 'El servidor debe anunciar su puerto.');
    const base = `http://127.0.0.1:${port}`;
    const html = await fetch(base);
    assert.equal(html.status, 200);
    const text = await html.text();
    assert.match(text, /Registro · Lost&Found UEx/);
    const script = text.match(/src="(\/assets\/[^" ]+\.js)"/)?.[1];
    assert.ok(script, 'Debe servirse el bundle React compilado.');
    assert.equal((await fetch(base + script)).status, 200);
    const result = await fetch(base + '/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'monolito@example.com', password: 'Prueba1234' }),
    });
    assert.equal(result.status, 201);
    assert.equal((await result.json()).user.rol, 'USUARIO');
  } finally {
    if (child && child.exitCode === null) {
      const stopped = once(child, 'exit');
      child.kill();
      await stopped;
    }
    await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await pool.end();
  }
});
