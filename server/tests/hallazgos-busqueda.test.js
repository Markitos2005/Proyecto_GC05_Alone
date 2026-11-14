import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import session from 'express-session';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';
import { validateBusqueda } from '../src/validation/hallazgos.js';

// SCRUM-107 / US-009. Solo datos ficticios; el almacenamiento se simula (PostgreSQL real en hallazgos-busqueda.postgres.test.js).
const ID = '44444444-4444-4444-8444-444444444444';
const CATEGORIA = '11111111-1111-4111-8111-111111111111';
const FACULTAD = '22222222-2222-4222-8222-222222222222';
const CORTE = '2026-11-14T10:00:00.123456+00:00';
let hash;
beforeAll(async () => { hash = await argon2.hash('Prueba1234'); });

const row = (extra = {}) => ({
  id: ID, descripcion: 'Mochila ficticia', fecha_hallazgo: '2026-01-01', latitud: 39.478912, longitud: -6.342412,
  punto_entrega: 'Conserjería ficticia', estado: 'Activo', publicado_en: '2026-11-13T09:00:00+00:00',
  categoria_id: CATEGORIA, categoria_nombre: 'Mochilas y bolsos', facultad_id: FACULTAD, facultad_nombre: 'Facultad ficticia',
  imagenes: [1, 2], ...extra,
});

async function fixture({ total = 1, hallazgos = [row()], login = true, unavailable = false } = {}) {
  const user = { id: '33333333-3333-4333-8333-333333333333', email: 'persona@example.com', rol: 'USUARIO', activo: true, password_hash: hash };
  const users = { findByEmail: async () => user, findById: async () => user };
  const storage = {
    search: vi.fn(async () => ({ total, corte: CORTE, hallazgos })),
    getImage: vi.fn(async (id, posicion) => (posicion === 1 ? { mime: 'image/png', datos: Buffer.from('png-ficticio') } : null)),
  };
  const app = createApp({ users, ...(unavailable ? {} : { hallazgoStorage: storage }), searchLimit: 3,
    sessionMiddleware: session({ secret: 'secreto-ficticio-solo-de-pruebas-mas-de-32', resave: false, saveUninitialized: false }) });
  const agent = request.agent(app);
  if (login) await agent.post('/api/auth/login').send({ email: user.email, password: 'Prueba1234' });
  return { agent, storage };
}

describe('SCRUM-107: validación de los filtros', () => {
  it('sin filtros: primera página de 12 y sin términos', () => {
    expect(validateBusqueda({})).toEqual({ errors: {}, value: {
      terminos: [], q: '', categoriaId: '', facultadId: '', fechaDesde: '', fechaHasta: '', pagina: 1, tamano: 12, corte: '' } });
  });
  it('normaliza el texto y lo separa en palabras', () => {
    expect(validateBusqueda({ q: '  mochila   AZUL ' }).value).toMatchObject({ q: 'mochila AZUL', terminos: ['mochila', 'AZUL'] });
  });
  it('acepta el corte que devuelve PostgreSQL, con microsegundos', () => {
    expect(validateBusqueda({ corte: CORTE }).errors).toEqual({});
  });
  it.each([
    [{ pagina: '0' }, 'pagina'], [{ pagina: '-1' }, 'pagina'], [{ pagina: '1.5' }, 'pagina'], [{ pagina: 'dos' }, 'pagina'],
    [{ tamano: '0' }, 'tamano'], [{ tamano: '51' }, 'tamano'],
    [{ categoriaId: 'no-uuid' }, 'categoriaId'], [{ facultadId: '1' }, 'facultadId'],
    [{ fechaDesde: '2026-02-30' }, 'fechaDesde'], [{ fechaHasta: '01/01/2026' }, 'fechaHasta'],
    [{ fechaDesde: '2026-02-01', fechaHasta: '2026-01-01' }, 'fechaHasta'],
    [{ q: 'a'.repeat(101) }, 'q'], [{ q: ['a', 'b'] }, 'q'],
    [{ corte: 'ayer' }, 'corte'], [{ autorId: ID }, 'parametros'],
  ])('rechaza %o', (query, field) => {
    expect(validateBusqueda(query).errors).toHaveProperty(field);
  });
});

describe('SCRUM-107: GET /api/hallazgos', () => {
  it('sin sesión responde 401 y no consulta el almacenamiento', async () => {
    const { agent, storage } = await fixture({ login: false });
    expect((await agent.get('/api/hallazgos')).status).toBe(401);
    expect((await agent.get(`/api/hallazgos/${ID}/imagenes/1`)).status).toBe(401);
    expect(storage.search).not.toHaveBeenCalled();
  });

  it('AC-01/AC-03: devuelve los datos públicos, la ubicación aproximada y las URL de las fotos', async () => {
    const { agent, storage } = await fixture();
    const result = await agent.get('/api/hallazgos').query({ q: 'mochila', categoriaId: CATEGORIA, facultadId: FACULTAD, fechaDesde: '2026-01-01', fechaHasta: '2026-01-31', tamano: '5' });
    expect(result.status).toBe(200);
    expect(storage.search).toHaveBeenCalledWith(expect.objectContaining({
      terminos: ['mochila'], categoriaId: CATEGORIA, facultadId: FACULTAD, fechaDesde: '2026-01-01', fechaHasta: '2026-01-31', pagina: 1, tamano: 5, corte: '' }));
    expect(result.body.hallazgos).toEqual([{
      id: ID, categoria: { id: CATEGORIA, nombre: 'Mochilas y bolsos' }, facultad: { id: FACULTAD, nombre: 'Facultad ficticia' },
      descripcion: 'Mochila ficticia', fechaHallazgo: '2026-01-01',
      ubicacion: { latitud: 39.479, longitud: -6.342, puntoEntrega: 'Conserjería ficticia' },
      estado: 'Activo', publicadoEn: '2026-11-13T09:00:00+00:00',
      imagenes: [`/api/hallazgos/${ID}/imagenes/1`, `/api/hallazgos/${ID}/imagenes/2`],
    }]);
    expect(result.body.paginacion).toEqual({ pagina: 1, tamano: 5, total: 1, totalPaginas: 1, anterior: null, siguiente: null, corte: CORTE });
    expect(result.headers['cache-control']).toBe('no-store');
  });

  it('AC-04: nunca expone rasgos privados, autor ni correo aunque el almacenamiento los devuelva', async () => {
    const { agent } = await fixture({ hallazgos: [row({ rasgos: 'Llavero privado', autor_id: 'autor', email: 'persona@example.com', password_hash: 'x' })] });
    const body = JSON.stringify((await agent.get('/api/hallazgos')).body);
    for (const secreto of ['Llavero privado', 'autor', 'persona@example.com', 'password_hash']) expect(body).not.toContain(secreto);
  });

  it('AC-02: indica la página anterior y la siguiente y reenvía el corte', async () => {
    const { agent, storage } = await fixture({ total: 30 });
    const result = await agent.get('/api/hallazgos').query({ pagina: '2', tamano: '10', corte: CORTE });
    expect(storage.search).toHaveBeenCalledWith(expect.objectContaining({ pagina: 2, tamano: 10, corte: CORTE }));
    expect(result.body.paginacion).toMatchObject({ pagina: 2, total: 30, totalPaginas: 3, anterior: 1, siguiente: 3 });
  });

  it.each([
    [{}, 'Todavía no hay hallazgos activos.'],
    [{ q: 'paraguas' }, 'No hay hallazgos activos que coincidan con la búsqueda.'],
  ])('AC-05: sin resultados responde 200 con un mensaje comprensible (%o)', async (query, message) => {
    const { agent } = await fixture({ total: 0, hallazgos: [] });
    const result = await agent.get('/api/hallazgos').query(query);
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({ hallazgos: [], message, paginacion: { pagina: 1, total: 0, totalPaginas: 0, anterior: null, siguiente: null } });
  });

  it('AC-05: una página que no existe responde 404 con el número de páginas', async () => {
    const { agent } = await fixture({ total: 13, hallazgos: [] });
    const result = await agent.get('/api/hallazgos').query({ pagina: '3' });
    expect(result.status).toBe(404);
    expect(result.body).toEqual({ message: 'La página solicitada no existe.', errors: { pagina: 'Hay 2 páginas de resultados.' } });
  });

  it('filtros no válidos: 400 con errores por campo y sin consultar', async () => {
    const { agent, storage } = await fixture();
    const result = await agent.get('/api/hallazgos?pagina=0&categoriaId=x');
    expect(result.status).toBe(400);
    expect(Object.keys(result.body.errors)).toEqual(['categoriaId', 'pagina']);
    expect(storage.search).not.toHaveBeenCalled();
  });

  it('limita las búsquedas repetidas', async () => {
    const { agent } = await fixture();
    for (let i = 0; i < 3; i += 1) expect((await agent.get('/api/hallazgos')).status).toBe(200);
    expect((await agent.get('/api/hallazgos')).status).toBe(429);
  });

  it('sin base de datos responde 503, nunca un listado vacío simulado', async () => {
    const { agent } = await fixture({ unavailable: true });
    const result = await agent.get('/api/hallazgos');
    expect(result.status).toBe(503);
    expect(result.body.message).toBe('La búsqueda de hallazgos no está disponible en este momento.');
  });
});

describe('SCRUM-107: GET /api/hallazgos/:id/imagenes/:posicion', () => {
  it('sirve la foto con su tipo y sin permitir que el navegador lo adivine', async () => {
    const { agent, storage } = await fixture();
    const result = await agent.get(`/api/hallazgos/${ID}/imagenes/1`).buffer(true);
    expect(result.status).toBe(200);
    expect(result.headers['content-type']).toBe('image/png');
    expect(result.headers['x-content-type-options']).toBe('nosniff');
    expect(storage.getImage).toHaveBeenCalledWith(ID, 1);
  });
  it.each([`/api/hallazgos/${ID}/imagenes/2`, `/api/hallazgos/${ID}/imagenes/6`, '/api/hallazgos/no-uuid/imagenes/1'])('404 si no existe, no es pública o la ruta no es válida: %s', async (path) => {
    const { agent } = await fixture();
    const result = await agent.get(path);
    expect(result.status).toBe(404);
    expect(result.body.message).toBe('Imagen no encontrada.');
  });
});
