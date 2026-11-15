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

test('SCRUM-105: hallazgos, rasgos privados y fotos guardados de forma atómica en PostgreSQL real', async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const schema = `hallazgo_storage_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  try {
    // 007 se aplica dos veces: la migración debe ser idempotente.
    for (const name of ['001-usuarios.sql', '002-sesiones.sql', '003-perfil.sql', '007-hallazgos.sql', '007-hallazgos.sql','008-historial-hallazgos.sql','008-historial-hallazgos.sql']) {
      await pool.query(await readFile(new URL(`../db/migrations/${name}`, import.meta.url), 'utf8'));
    }
    const storage = createHallazgoRepository(pool);
    const autor = randomUUID();
    const desactivado = randomUUID();
    const facultad = randomUUID();
    const otraFacultad = randomUUID();
    const categoria = randomUUID();
    const inactiva = randomUUID();
    const password = await hashPassword('Prueba1234');
    await pool.query(
      'INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, activo) VALUES ($1, $2, $3, $4, $5, TRUE), ($6, $7, $3, $4, $5, FALSE)',
      [autor, 'persona@example.com', password, 'Persona', 'Ficticia', desactivado, 'baja@example.com'],
    );
    await pool.query('INSERT INTO facultades (id, nombre, activo) VALUES ($1, $2, TRUE), ($3, $4, FALSE)',
      [facultad, 'Facultad Ficticia A', otraFacultad, 'Facultad Ficticia B']);
    await pool.query('INSERT INTO categorias (id, nombre, activo) VALUES ($1, $2, TRUE), ($3, $4, FALSE)',
      [categoria, 'Categoría ficticia', inactiva, 'Categoría retirada']);

    const count = async (table) => (await pool.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n;
    const photo = (background) => sharp({ create: { width: 4, height: 4, channels: 3, background } })
      .withExif({ IFD0: { Copyright: 'Metadato ficticio' } }).jpeg().toBuffer();
    const datos = {
      facultadId: facultad, categoriaId: categoria, descripcion: '  Mochila ficticia de color azul  ', fechaHallazgo: '2026-01-01',
      latitud: 39.4789, longitud: -6.3424, puntoEntrega: 'Conserjería ficticia', rasgosPrivados: 'Llavero ficticio dentro',
    };
    const app = createApp({
      users: createUserRepository(pool),
      sessionMiddleware: createSessionMiddleware(pool, 'secreto-ficticio-de-pruebas-hallazgos-mas-de-32'),
      hallazgoStorage: storage,
    });
    const agent = request.agent(app);
    assert.equal((await agent.post('/api/auth/login').send({ email: 'persona@example.com', password: 'Prueba1234' })).status, 200);
    const publish = (body = datos, photos = 2) => {
      let req = agent.post('/api/hallazgos').set('Origin', ORIGIN).field('datos', JSON.stringify(body));
      return Promise.all(Array.from({ length: photos }, (_, i) => photo(i ? 'red' : 'blue'))).then((buffers) => {
        for (const [i, buffer] of buffers.entries()) req = req.attach('imagenes', buffer, { filename: `../../foto-${i}.jpg`, contentType: 'image/jpeg' });
        return req;
      });
    };

    await t.test('SCRUM-103: un usuario normal ve las facultades y categorías activas', async () => {
      assert.equal(await storage.getPublicationContext(desactivado), null);
      const result = await agent.get('/api/hallazgos/opciones');
      assert.equal(result.status, 200);
      assert.deepEqual(result.body, {
        facultades: [{ id: facultad, nombre: 'Facultad Ficticia A' }],
        categorias: [{ id: categoria, nombre: 'Categoría ficticia' }],
      });
    });

    await t.test('AC-05/AC-06: un usuario normal publica; hallazgo Activo del autor, rasgos aparte y fotos sin metadatos', async () => {
      const result = await publish();
      assert.equal(result.status, 201);
      const { id } = result.body.hallazgo;
      const { rows: [hallazgo] } = await pool.query('SELECT * FROM hallazgos WHERE id = $1', [id]);
      assert.equal(hallazgo.autor_id, autor);
      assert.equal(hallazgo.facultad_id, facultad);
      assert.equal(hallazgo.categoria_id, categoria);
      assert.equal(hallazgo.estado, 'Activo');
      assert.equal(hallazgo.descripcion, 'Mochila ficticia de color azul');
      assert.equal(hallazgo.latitud, 39.4789);
      assert.equal(hallazgo.punto_entrega, 'Conserjería ficticia');
      // La tabla pública no contiene los rasgos privados en ninguna columna.
      assert.equal(JSON.stringify(hallazgo).includes('Llavero'), false);
      const { rows: rasgos } = await pool.query('SELECT rasgos FROM hallazgo_rasgos_privados WHERE hallazgo_id = $1', [id]);
      assert.deepEqual(rasgos, [{ rasgos: 'Llavero ficticio dentro' }]);

      const { rows: imagenes } = await pool.query('SELECT posicion, mime, datos FROM hallazgo_imagenes WHERE hallazgo_id = $1 ORDER BY posicion', [id]);
      assert.deepEqual(imagenes.map((row) => [row.posicion, row.mime]), [[1, 'image/jpeg'], [2, 'image/jpeg']]);
      for (const row of imagenes) {
        const metadata = await sharp(row.datos).metadata();
        assert.equal(metadata.format, 'jpeg');
        assert.equal(metadata.exif, undefined);
      }
      assert.equal(JSON.stringify(result.body).includes('Llavero'), false);
    });

    await t.test('SCRUM-114: el propietario edita un hallazgo Activo sin cambiar el autor', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;

      const response = await agent
        .patch(`/api/hallazgos/${id}`)
        .set('Origin', ORIGIN)
        .send({
          descripcion: 'Mochila azul con cremallera negra',
          rasgosPrivados: 'Etiqueta interior con iniciales',
        });

      assert.equal(response.status, 200);

      const { rows: [hallazgo] } = await pool.query(
        'SELECT autor_id, descripcion, estado FROM hallazgos WHERE id = $1',
        [id],
      );

      assert.equal(hallazgo.autor_id, autor);
      assert.equal(hallazgo.descripcion, 'Mochila azul con cremallera negra');
      assert.equal(hallazgo.estado, 'Activo');

      const { rows: [privados] } = await pool.query(
        'SELECT rasgos FROM hallazgo_rasgos_privados WHERE hallazgo_id = $1',
        [id],
      );

      assert.equal(privados.rasgos, 'Etiqueta interior con iniciales');
    });

    await t.test('SCRUM-114: otro usuario no puede editar un hallazgo ajeno', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;
      const otroUsuario = randomUUID();

      await pool.query(
        `INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, activo)
        VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [otroUsuario, 'otro@example.com', password, 'Otro', 'Usuario'],
      );

      const otroAgent = request.agent(app);
      const login = await otroAgent.post('/api/auth/login').send({
        email: 'otro@example.com',
        password: 'Prueba1234',
      });
      assert.equal(login.status, 200);

      const response = await otroAgent
        .patch(`/api/hallazgos/${id}`)
        .set('Origin', ORIGIN)
        .send({ descripcion: 'Modificación no autorizada' });

      assert.equal(response.status, 404);

      const { rows: [hallazgo] } = await pool.query(
        'SELECT autor_id, descripcion FROM hallazgos WHERE id = $1',
        [id],
      );

      assert.equal(hallazgo.autor_id, autor);
      assert.equal(hallazgo.descripcion, 'Mochila ficticia de color azul');
    });

    await t.test('SCRUM-114: no permite editar hallazgos Devueltos ni Retirados', async () => {
      for (const estado of ['Devuelto', 'Retirado']) {
        const publicado = await publish(datos, 1);
        assert.equal(publicado.status, 201);

        const id = publicado.body.hallazgo.id;

        // Preparación del escenario: todavía no existe el endpoint
        // para cambiar el estado mediante la API.
        await pool.query(
          'UPDATE hallazgos SET estado = $1 WHERE id = $2',
          [estado, id],
        );

        const response = await agent
          .patch(`/api/hallazgos/${id}`)
          .set('Origin', ORIGIN)
          .send({ descripcion: 'Intento de edición posterior' });

        assert.equal(response.status, 409);

        const { rows: [hallazgo] } = await pool.query(
          'SELECT autor_id, descripcion, estado FROM hallazgos WHERE id = $1',
          [id],
        );

        assert.equal(hallazgo.autor_id, autor);
        assert.equal(hallazgo.estado, estado);
        assert.equal(hallazgo.descripcion, 'Mochila ficticia de color azul');
      }
    });

    await t.test('SCRUM-114: cambiar a Devuelto registra el historial', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;

      const response = await agent
        .patch(`/api/hallazgos/${id}/estado`)
        .set('Origin', ORIGIN)
        .send({
          estado: 'Devuelto',
          motivo: 'Entregado a su propietario',
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.hallazgo.id, id);
      assert.equal(response.body.hallazgo.estado, 'Devuelto');

      const { rows: [hallazgo] } = await pool.query(
        'SELECT autor_id, estado FROM hallazgos WHERE id = $1',
        [id],
      );

      assert.equal(hallazgo.autor_id, autor);
      assert.equal(hallazgo.estado, 'Devuelto');

      const { rows: historial } = await pool.query(
        `SELECT usuario_id, estado_anterior, estado_nuevo, motivo, created_at
        FROM hallazgo_historial_estados
        WHERE hallazgo_id = $1`,
        [id],
      );

      assert.equal(historial.length, 1);
      assert.equal(historial[0].usuario_id, autor);
      assert.equal(historial[0].estado_anterior, 'Activo');
      assert.equal(historial[0].estado_nuevo, 'Devuelto');
      assert.equal(historial[0].motivo, 'Entregado a su propietario');
      assert.ok(historial[0].created_at instanceof Date);
    });

    await t.test('SCRUM-114: solo el propietario puede consultar el historial', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;

      // El historial de un hallazgo recién publicado está vacío.
      const inicial = await agent.get(`/api/hallazgos/${id}/historial`);
      assert.equal(inicial.status, 200);
      assert.deepEqual(inicial.body.historial, []);

      // El propietario cambia el estado.
      const cambio = await agent
        .patch(`/api/hallazgos/${id}/estado`)
        .set('Origin', ORIGIN)
        .send({
          estado: 'Devuelto',
          motivo: 'Entregado en conserjería',
        });

      assert.equal(cambio.status, 200);

      // El propietario puede consultar el cambio registrado.
      const consulta = await agent.get(`/api/hallazgos/${id}/historial`);
      assert.equal(consulta.status, 200);
      assert.equal(consulta.body.historial.length, 1);

      const registro = consulta.body.historial[0];
      assert.equal(registro.usuarioId, autor);
      assert.equal(registro.estadoAnterior, 'Activo');
      assert.equal(registro.estadoNuevo, 'Devuelto');
      assert.equal(registro.motivo, 'Entregado en conserjería');
      assert.ok(registro.fecha);

      // Otro usuario autenticado no puede consultar este historial.
      const otroUsuario = randomUUID();

      await pool.query(
        `INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, activo)
        VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [otroUsuario, 'otro-historial@example.com', password, 'Otro', 'Usuario'],
      );

      const otroAgent = request.agent(app);
      const login = await otroAgent.post('/api/auth/login').send({
        email: 'otro-historial@example.com',
        password: 'Prueba1234',
      });

      assert.equal(login.status, 200);

      const ajeno = await otroAgent.get(`/api/hallazgos/${id}/historial`);
      assert.equal(ajeno.status, 404);
      assert.equal(ajeno.body.historial, undefined);
    });

    await t.test('SCRUM-114: solo el propietario puede consultar sus imágenes', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;

      // Obtener el identificador de la imagen almacenada.
      const { rows: [imagen] } = await pool.query(
        `SELECT id, mime, datos
        FROM hallazgo_imagenes
        WHERE hallazgo_id = $1`,
        [id],
      );

      assert.ok(imagen);

      // El propietario puede recuperar la imagen.
      const propia = await agent.get(
        `/api/hallazgos/${id}/imagenes/${imagen.id}`,
      );

      assert.equal(propia.status, 200);
      assert.equal(propia.headers['content-type'], 'image/jpeg');
      assert.equal(propia.headers['cache-control'], 'private, no-store');
      assert.deepEqual(propia.body, imagen.datos);

      // Crear un segundo usuario con su propia sesión.
      const otroUsuario = randomUUID();

      await pool.query(
        `INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, activo)
        VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [otroUsuario, 'otro-imagen@example.com', password, 'Otro', 'Usuario'],
      );

      const otroAgent = request.agent(app);

      const login = await otroAgent.post('/api/auth/login').send({
        email: 'otro-imagen@example.com',
        password: 'Prueba1234',
      });

      assert.equal(login.status, 200);

      // Conocer los identificadores no permite acceder a la imagen ajena.
      const ajena = await otroAgent.get(
        `/api/hallazgos/${id}/imagenes/${imagen.id}`,
      );

      assert.equal(ajena.status, 404);

      // Tampoco se puede acceder sin iniciar sesión.
      const anonima = await request(app).get(
        `/api/hallazgos/${id}/imagenes/${imagen.id}`,
      );

      assert.equal(anonima.status, 401);
    });

    await t.test('SCRUM-114: Retirado queda registrado y no se puede reactivar', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;

      const retirar = await agent
        .patch(`/api/hallazgos/${id}/estado`)
        .set('Origin', ORIGIN)
        .send({
          estado: 'Retirado',
          motivo: 'El autor retira el anuncio',
        });

      assert.equal(retirar.status, 200);
      assert.equal(retirar.body.hallazgo.estado, 'Retirado');

      const reactivar = await agent
        .patch(`/api/hallazgos/${id}/estado`)
        .set('Origin', ORIGIN)
        .send({ estado: 'Activo' });

      assert.equal(reactivar.status, 400);

      const cambiarOtraVez = await agent
        .patch(`/api/hallazgos/${id}/estado`)
        .set('Origin', ORIGIN)
        .send({ estado: 'Devuelto' });

      assert.equal(cambiarOtraVez.status, 409);

      const { rows: [hallazgo] } = await pool.query(
        'SELECT autor_id, estado FROM hallazgos WHERE id = $1',
        [id],
      );

      assert.equal(hallazgo.autor_id, autor);
      assert.equal(hallazgo.estado, 'Retirado');

      const { rows: historial } = await pool.query(
        `SELECT usuario_id, estado_anterior, estado_nuevo, motivo, created_at
        FROM hallazgo_historial_estados
        WHERE hallazgo_id = $1`,
        [id],
      );

      assert.equal(historial.length, 1);
      assert.equal(historial[0].usuario_id, autor);
      assert.equal(historial[0].estado_anterior, 'Activo');
      assert.equal(historial[0].estado_nuevo, 'Retirado');
      assert.equal(historial[0].motivo, 'El autor retira el anuncio');
      assert.ok(historial[0].created_at instanceof Date);
    });

    await t.test('SCRUM-114: otro usuario no puede cambiar el estado de un hallazgo ajeno', async () => {
      const publicado = await publish(datos, 1);
      assert.equal(publicado.status, 201);

      const id = publicado.body.hallazgo.id;

      const otroUsuario = randomUUID();

      await pool.query(
        `INSERT INTO usuarios (id, email, password_hash, nombre, apellidos, activo)
        VALUES ($1, $2, $3, $4, $5, TRUE)`,
        [otroUsuario, 'otro-estado@example.com', password, 'Otro', 'Usuario'],
      );

      const otroAgent = request.agent(app);

      const login = await otroAgent.post('/api/auth/login').send({
        email: 'otro-estado@example.com',
        password: 'Prueba1234',
      });

      assert.equal(login.status, 200);

      for (const estado of ['Devuelto', 'Retirado']) {
        const response = await otroAgent
          .patch(`/api/hallazgos/${id}/estado`)
          .set('Origin', ORIGIN)
          .send({
            estado,
            motivo: 'Intento no autorizado',
          });

        assert.equal(response.status, 404);
      }

      const { rows: [hallazgo] } = await pool.query(
        'SELECT autor_id, estado FROM hallazgos WHERE id = $1',
        [id],
      );

      assert.equal(hallazgo.autor_id, autor);
      assert.equal(hallazgo.estado, 'Activo');

      const { rows: [historial] } = await pool.query(
        `SELECT count(*)::int AS total
        FROM hallazgo_historial_estados
        WHERE hallazgo_id = $1`,
        [id],
      );

      assert.equal(historial.total, 0);
    });

    await t.test('sin rasgos privados ni punto de entrega no crea filas vacías', async () => {
      const { rasgosPrivados, puntoEntrega, ...minimo } = datos;
      const result = await publish(minimo, 1);
      assert.equal(result.status, 201);
      const { id } = result.body.hallazgo;
      assert.equal((await pool.query('SELECT punto_entrega FROM hallazgos WHERE id = $1', [id])).rows[0].punto_entrega, null);
      assert.equal((await pool.query('SELECT 1 FROM hallazgo_rasgos_privados WHERE hallazgo_id = $1', [id])).rowCount, 0);
    });

    await t.test('AC-08: si falla una foto, no queda ni el hallazgo ni ninguna foto', async () => {
      const before = [await count('hallazgos'), await count('hallazgo_imagenes'), await count('hallazgo_rasgos_privados')];
      const good = { buffer: await photo('blue'), mime: 'image/jpeg' };
      await assert.rejects(storage.publish({
        ...datos, autorId: autor, estado: 'Activo',
        imagenes: [good, { buffer: Buffer.from('x'), mime: 'image/gif' }],
      }), { code: '23514' });
      assert.deepEqual([await count('hallazgos'), await count('hallazgo_imagenes'), await count('hallazgo_rasgos_privados')], before);
    });

    await t.test('revalida en la transacción: categoría o facultad inactivas y cuenta desactivada', async () => {
      const before = await count('hallazgos');
      const base = { ...datos, autorId: autor, estado: 'Activo', imagenes: [{ buffer: await photo('blue'), mime: 'image/jpeg' }] };
      await assert.rejects(storage.publish({ ...base, categoriaId: inactiva }), { status: 400, errors: { categoriaId: 'La categoría no existe o está inactiva.' } });
      await assert.rejects(storage.publish({ ...base, facultadId: otraFacultad }), { status: 400, errors: { facultadId: 'La facultad no existe o está inactiva.' } });
      await assert.rejects(storage.publish({ ...base, facultadId: randomUUID() }), { status: 400 });
      await assert.rejects(storage.publish({ ...base, autorId: desactivado }), { status: 403 });
      assert.equal(await count('hallazgos'), before);
    });

    await t.test('facultad desactivada: desaparece de las opciones y no se puede publicar en ella', async () => {
      await pool.query('UPDATE facultades SET activo = FALSE WHERE id = $1', [facultad]);
      assert.deepEqual((await agent.get('/api/hallazgos/opciones')).body.facultades, []);
      const result = await publish();
      assert.equal(result.status, 400);
      assert.ok(result.body.errors.facultadId);
      await pool.query('UPDATE facultades SET activo = TRUE WHERE id = $1', [facultad]);
    });

    await t.test('la base de datos rechaza coordenadas y estados no válidos', async () => {
      const insert = (lat, estado) => pool.query(
        `INSERT INTO hallazgos (id, autor_id, facultad_id, categoria_id, descripcion, fecha_hallazgo, latitud, longitud, estado)
         VALUES ($1, $2, $3, $4, 'Objeto ficticio', '2026-01-01', $5, 0, $6)`,
        [randomUUID(), autor, facultad, categoria, lat, estado],
      );
      await assert.rejects(insert(91, 'Activo'), { code: '23514' });
      await assert.rejects(insert(0, 'Perdido'), { code: '23514' });
    });
  } finally {
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
