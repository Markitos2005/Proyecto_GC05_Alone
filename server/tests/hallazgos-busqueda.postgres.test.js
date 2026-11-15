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

test('SCRUM-107: búsqueda paginada de hallazgos Activos en PostgreSQL real', async (t) => {
  assert.ok(process.env.TEST_DATABASE_URL, 'Configura TEST_DATABASE_URL independiente.');
  assert.notEqual(process.env.TEST_DATABASE_URL, process.env.DATABASE_URL);
  const schema = `hallazgo_busqueda_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
  await admin.query(`CREATE SCHEMA "${schema}"`);
  const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema}` });
  try {
    for (const name of ['001-usuarios.sql', '002-sesiones.sql', '003-perfil.sql', '007-hallazgos.sql']) {
      await pool.query(await readFile(new URL(`../db/migrations/${name}`, import.meta.url), 'utf8'));
    }
    const autor = randomUUID();
    const [facultadA, facultadB, mochilas, llaves] = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
    await pool.query('INSERT INTO usuarios (id, email, password_hash, nombre, apellidos) VALUES ($1, $2, $3, $4, $5)',
      [autor, 'persona@example.com', await hashPassword('Prueba1234'), 'Persona', 'Ficticia']);
    await pool.query('INSERT INTO facultades (id, nombre) VALUES ($1, $2), ($3, $4)', [facultadA, 'Facultad Ficticia A', facultadB, 'Facultad Ficticia B']);
    await pool.query('INSERT INTO categorias (id, nombre) VALUES ($1, $2), ($3, $4)', [mochilas, 'Mochilas ficticias', llaves, 'Llaves ficticias']);

    const photo = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'blue' } }).png().toBuffer();
    let minuto = 0;
    /** Inserta directamente un hallazgo con fecha de creación controlada (cada uno, un minuto después del anterior). */
    async function hallazgo({ descripcion = 'Objeto ficticio', facultad = facultadA, categoria = mochilas, fecha = '2026-01-15', estado = 'Activo', fotos = 0, rasgos } = {}) {
      const id = randomUUID();
      minuto += 1;
      await pool.query(
        `INSERT INTO hallazgos (id, autor_id, facultad_id, categoria_id, descripcion, fecha_hallazgo, latitud, longitud, punto_entrega, estado, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 39.4789123, -6.3424123, 'Conserjería ficticia', $7, clock_timestamp() - INTERVAL '1 day' + $8 * INTERVAL '1 minute')`,
        [id, autor, facultad, categoria, descripcion, fecha, estado, minuto],
      );
      if (rasgos) await pool.query('INSERT INTO hallazgo_rasgos_privados (hallazgo_id, rasgos) VALUES ($1, $2)', [id, rasgos]);
      for (let posicion = 1; posicion <= fotos; posicion += 1) {
        await pool.query('INSERT INTO hallazgo_imagenes (id, hallazgo_id, posicion, mime, datos) VALUES ($1, $2, $3, $4, $5)',
          [randomUUID(), id, posicion, 'image/png', photo]);
      }
      return id;
    }

    const app = createApp({
      users: createUserRepository(pool),
      sessionMiddleware: createSessionMiddleware(pool, 'secreto-ficticio-de-pruebas-busqueda-mas-de-32'),
      hallazgoStorage: createHallazgoRepository(pool),
    });
    const agent = request.agent(app);
    assert.equal((await agent.post('/api/auth/login').send({ email: 'persona@example.com', password: 'Prueba1234' })).status, 200);
    const buscar = (query = {}) => agent.get('/api/hallazgos').query(query);

    await t.test('AC-05: con cero hallazgos responde 200, lista vacía y mensaje', async () => {
      const result = await buscar();
      assert.equal(result.status, 200);
      assert.deepEqual(result.body.hallazgos, []);
      assert.equal(result.body.message, 'Todavía no hay hallazgos activos.');
      assert.deepEqual({ ...result.body.paginacion, corte: undefined },
        { pagina: 1, tamano: 12, total: 0, totalPaginas: 0, anterior: null, siguiente: null, corte: undefined });
    });

    let conFotos;
    await t.test('un resultado: datos públicos, fotos servidas y sin rasgos privados', async () => {
      conFotos = await hallazgo({ descripcion: 'Mochila azul ficticia', fotos: 2, rasgos: 'Llavero privado ficticio' });
      const result = await buscar();
      assert.equal(result.status, 200);
      assert.equal(result.body.paginacion.total, 1);
      const [item] = result.body.hallazgos;
      assert.deepEqual(item, {
        id: conFotos, categoria: { id: mochilas, nombre: 'Mochilas ficticias' }, facultad: { id: facultadA, nombre: 'Facultad Ficticia A' },
        descripcion: 'Mochila azul ficticia', fechaHallazgo: '2026-01-15',
        ubicacion: { latitud: 39.479, longitud: -6.342, puntoEntrega: 'Conserjería ficticia' },
        estado: 'Activo', publicadoEn: item.publicadoEn,
        imagenes: [`/api/hallazgos/${conFotos}/imagenes/1`, `/api/hallazgos/${conFotos}/imagenes/2`],
      });
      assert.ok(Number.isFinite(Date.parse(item.publicadoEn)));
      const body = JSON.stringify(result.body);
      assert.equal(body.includes('Llavero'), false);
      assert.equal(body.includes('persona@example.com'), false);
      assert.equal(body.includes(autor), false);

      const image = await agent.get(item.imagenes[0]).buffer(true);
      assert.equal(image.status, 200);
      assert.equal(image.headers['content-type'], 'image/png');
      assert.deepEqual(Buffer.from(image.body), photo);
      assert.equal((await agent.get(`/api/hallazgos/${conFotos}/imagenes/3`)).status, 404);
    });

    await t.test('los hallazgos Devueltos y Retirados no aparecen ni sirven sus fotos', async () => {
      const retirado = await hallazgo({ descripcion: 'Retirado ficticio', estado: 'Retirado', fotos: 1 });
      await hallazgo({ descripcion: 'Devuelto ficticio', estado: 'Devuelto' });
      const result = await buscar();
      assert.deepEqual(result.body.hallazgos.map(item => item.id), [conFotos]);
      assert.equal((await agent.get(`/api/hallazgos/${retirado}/imagenes/1`)).status, 404);
    });

    const todos = [conFotos];
    await t.test('AC-01/AC-02: varias páginas, sin duplicados ni huecos, primera y última página', async () => {
      for (let i = 0; i < 6; i += 1) todos.push(await hallazgo({ descripcion: `Objeto ficticio ${i}` }));
      const esperado = [...todos].reverse(); // Más recientes primero.
      const primera = await buscar({ tamano: '3' });
      assert.deepEqual(primera.body.paginacion, { ...primera.body.paginacion, pagina: 1, total: 7, totalPaginas: 3, anterior: null, siguiente: 2 });
      const { corte } = primera.body.paginacion;

      // Un hallazgo publicado mientras se pagina no desplaza los resultados de las páginas siguientes.
      const nuevo = await pool.query("UPDATE hallazgos SET created_at = clock_timestamp() WHERE id = $1 RETURNING id", [await hallazgo({ descripcion: 'Publicado durante la paginación' })]);
      const segunda = await buscar({ tamano: '3', pagina: '2', corte });
      const ultima = await buscar({ tamano: '3', pagina: '3', corte });
      assert.deepEqual(ultima.body.paginacion, { ...ultima.body.paginacion, pagina: 3, totalPaginas: 3, anterior: 2, siguiente: null });
      assert.equal(ultima.body.hallazgos.length, 1);
      const vistos = [primera, segunda, ultima].flatMap(page => page.body.hallazgos.map(item => item.id));
      assert.deepEqual(vistos, esperado);

      // Volver atrás con el mismo corte devuelve exactamente la misma página.
      assert.deepEqual((await buscar({ tamano: '3', pagina: '1', corte })).body.hallazgos, primera.body.hallazgos);
      // Una búsqueda nueva (sin corte) sí incluye el recién publicado, el primero.
      assert.equal((await buscar({ tamano: '3' })).body.hallazgos[0].id, nuevo.rows[0].id);
      todos.push(nuevo.rows[0].id);

      const fuera = await buscar({ tamano: '3', pagina: '4', corte });
      assert.equal(fuera.status, 404);
      assert.equal(fuera.body.message, 'La página solicitada no existe.');
    });

    await t.test('filtros por categoría, facultad, fechas y texto', async () => {
      const llavesB = await hallazgo({ descripcion: 'Llaves con llavero ROJO', facultad: facultadB, categoria: llaves, fecha: '2026-03-10' });
      const porcentaje = await hallazgo({ descripcion: 'Cuaderno 100% ficticio', fecha: '2026-02-01' });
      const ids = async (query) => (await buscar({ ...query, tamano: '50' })).body.hallazgos.map(item => item.id);

      assert.deepEqual(await ids({ categoriaId: llaves }), [llavesB]);
      assert.deepEqual(await ids({ facultadId: facultadB }), [llavesB]);
      assert.equal((await ids({ facultadId: facultadA })).includes(llavesB), false);
      assert.deepEqual(await ids({ fechaDesde: '2026-02-01', fechaHasta: '2026-02-28' }), [porcentaje]);
      assert.deepEqual(await ids({ fechaDesde: '2026-03-10' }), [llavesB]);
      assert.deepEqual((await ids({ fechaHasta: '2026-01-31' })).sort(), [...todos].sort());
      // Sin distinguir mayúsculas; todas las palabras deben aparecer, en cualquier orden.
      assert.deepEqual(await ids({ q: 'rojo LLAVES' }), [llavesB]);
      assert.deepEqual(await ids({ q: 'llaves azul' }), []);
      // % y _ se buscan como texto, no como comodines.
      assert.deepEqual(await ids({ q: '100%' }), [porcentaje]);
      assert.deepEqual(await ids({ q: '%' }), [porcentaje]);
      assert.deepEqual(await ids({ q: '_' }), []);
      // Los rasgos privados no son buscables.
      assert.deepEqual(await ids({ q: 'Llavero privado' }), []);
      assert.deepEqual(await ids({ categoriaId: llaves, facultadId: facultadA }), []);

      const vacio = await buscar({ q: 'paraguas' });
      assert.equal(vacio.status, 200);
      assert.equal(vacio.body.message, 'No hay hallazgos activos que coincidan con la búsqueda.');
    });

    await t.test('sin sesión no hay acceso', async () => {
      assert.equal((await request(app).get('/api/hallazgos')).status, 401);
      assert.equal((await request(app).get(`/api/hallazgos/${conFotos}/imagenes/1`)).status, 401);
    });
  } finally {
    await pool.end();
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});
