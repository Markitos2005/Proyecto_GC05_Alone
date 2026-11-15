import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { createUserRepository } from '../src/repositories/users.js';
import { createHallazgoRepository } from '../src/repositories/hallazgos.js';
import { createSessionMiddleware } from '../src/security/sessions.js';
import { hashPassword } from '../src/security/passwords.js';

const ORIGIN = 'http://localhost:5173';

test('SCRUM-113: mis hallazgos en PostgreSQL real (listado, fecha y flujo completo)', async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const schema = `mis_hallazgos_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  try {
    for (const name of ['001-usuarios.sql', '002-sesiones.sql', '003-perfil.sql', '007-hallazgos.sql', '008-historial-hallazgos.sql']) {
      await pool.query(await readFile(new URL(`../db/migrations/${name}`, import.meta.url), 'utf8'));
    }
    const [yo, otra, facultad, categoria] = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
    const password = await hashPassword('Prueba1234');
    await pool.query('INSERT INTO usuarios (id, email, password_hash, nombre, apellidos) VALUES ($1, $2, $3, $4, $5), ($6, $7, $3, $4, $5)',
      [yo, 'persona@example.com', password, 'Persona', 'Ficticia', otra, 'otra@example.com']);
    await pool.query('INSERT INTO facultades (id, nombre) VALUES ($1, $2)', [facultad, 'Facultad Ficticia']);
    await pool.query('INSERT INTO categorias (id, nombre) VALUES ($1, $2)', [categoria, 'Categoría ficticia']);
    const photo = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).png().toBuffer();
    let minuto = 0;
    async function hallazgo(autor, descripcion, estado = 'Activo', fotos = 0) {
      const id = randomUUID();
      minuto += 1;
      await pool.query(
        `INSERT INTO hallazgos (id, autor_id, facultad_id, categoria_id, descripcion, fecha_hallazgo, latitud, longitud, estado, created_at)
         VALUES ($1, $2, $3, $4, $5, '2026-01-15', 39.4789, -6.3424, $6, clock_timestamp() - INTERVAL '1 day' + $7 * INTERVAL '1 minute')`,
        [id, autor, facultad, categoria, descripcion, estado, minuto]);
      for (let posicion = 1; posicion <= fotos; posicion += 1) {
        await pool.query('INSERT INTO hallazgo_imagenes (id, hallazgo_id, posicion, mime, datos) VALUES ($1, $2, $3, $4, $5)',
          [randomUUID(), id, posicion, 'image/png', photo]);
      }
      return id;
    }

    const app = createApp({ users: createUserRepository(pool), hallazgoStorage: createHallazgoRepository(pool),
      sessionMiddleware: createSessionMiddleware(pool, 'secreto-ficticio-de-pruebas-mis-hallazgos-mas-de-32') });
    const agent = request.agent(app);
    assert.equal((await agent.post('/api/auth/login').send({ email: 'persona@example.com', password: 'Prueba1234' })).status, 200);

    await t.test('sin hallazgos devuelve una lista vacía', async () => {
      const result = await agent.get('/api/hallazgos/mios');
      assert.equal(result.status, 200);
      assert.deepEqual(result.body, { hallazgos: [] });
    });

    let activo;
    await t.test('lista solo los propios, en cualquier estado, del más reciente al más antiguo', async () => {
      activo = await hallazgo(yo, 'Mochila ficticia', 'Activo', 2);
      const retirado = await hallazgo(yo, 'Paraguas ficticio', 'Retirado');
      await hallazgo(otra, 'Hallazgo de otra persona');
      const result = await agent.get('/api/hallazgos/mios');
      assert.deepEqual(result.body.hallazgos.map(item => [item.id, item.estado]), [[retirado, 'Retirado'], [activo, 'Activo']]);
      const [, mochila] = result.body.hallazgos;
      assert.equal(mochila.fechaHallazgo, '2026-01-15');
      assert.equal(mochila.categoria, 'Categoría ficticia');
      assert.equal(mochila.facultad, 'Facultad Ficticia');
      // La miniatura es la primera foto, servida por la ruta privada de fotos propias.
      const image = await agent.get(mochila.imagen).buffer(true);
      assert.equal(image.status, 200);
      assert.equal(image.headers['content-type'], 'image/png');
      assert.equal(result.body.hallazgos[0].imagen, null);
    });

    await t.test('el detalle devuelve la fecha tal cual, sin desplazarla por la zona horaria', async () => {
      const result = await agent.get(`/api/hallazgos/${activo}`);
      assert.equal(result.status, 200);
      assert.equal(result.body.hallazgo.fechaHallazgo, '2026-01-15');
    });

    await t.test('flujo de la pantalla: editar, marcar como devuelto y ver el historial', async () => {
      const patch = (path, body) => agent.patch(path).set('Origin', ORIGIN).send(body);
      assert.equal((await patch(`/api/hallazgos/${activo}`, { descripcion: 'Mochila verde ficticia', latitud: 39.5 })).status, 200);
      assert.equal((await patch(`/api/hallazgos/${activo}/estado`, { estado: 'Devuelto', motivo: 'Entregada a su propietario' })).status, 200);
      const [mochila] = (await agent.get('/api/hallazgos/mios')).body.hallazgos.filter(item => item.id === activo);
      assert.deepEqual([mochila.descripcion, mochila.estado], ['Mochila verde ficticia', 'Devuelto']);
      const { historial } = (await agent.get(`/api/hallazgos/${activo}/historial`)).body;
      assert.deepEqual(historial.map(entry => [entry.estadoAnterior, entry.estadoNuevo, entry.motivo]), [['Activo', 'Devuelto', 'Entregada a su propietario']]);
      // Ya no aparece en la búsqueda pública y no se puede reactivar.
      assert.equal((await agent.get('/api/hallazgos')).body.hallazgos.some(item => item.id === activo), false);
      assert.equal((await patch(`/api/hallazgos/${activo}/estado`, { estado: 'Activo' })).status, 400);
    });

    await t.test('sin sesión no hay acceso', async () => {
      assert.equal((await request(app).get('/api/hallazgos/mios')).status, 401);
    });
  } finally {
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
