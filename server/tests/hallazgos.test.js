import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import session from 'express-session';
import argon2 from 'argon2';
import sharp from 'sharp';
import { createApp } from '../src/app.js';
import { HALLAZGO_MAX_IMAGE_BYTES } from '../src/validation/hallazgos.js';

const category = '11111111-1111-4111-8111-111111111111';
const faculty = '22222222-2222-4222-8222-222222222222';
const data = { facultadId: faculty, categoriaId: category, descripcion: 'Mochila ficticia', fechaHallazgo: '2026-01-01', latitud: 0, longitud: 0, puntoEntrega: 'Conserjería ficticia', rasgosPrivados: 'Marca privada ficticia' };
let png, jpg, hash;
beforeAll(async () => {
  png = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).png().toBuffer();
  jpg = await sharp(png).jpeg().toBuffer();
  hash = await argon2.hash('Prueba1234');
});

async function fixture({ role = 'USUARIO', context, unavailable = false } = {}) {
  const user = { id: '33333333-3333-4333-8333-333333333333', email: 'persona@example.com', rol: role, activo: true, password_hash: hash };
  const users = { findByEmail: async () => user, findById: async () => user };
  const storage = {
    getPublicationContext: vi.fn(async () => context === undefined ? { facultades: [{ id: faculty, nombre: 'Facultad ficticia', activo: true }], categorias: [{ id: category, nombre: 'Categoría ficticia', activo: true }] } : context),
    publish: vi.fn(async () => ({ id: 'nuevo-hallazgo', rasgosPrivados: 'NO DEVOLVER', password_hash: 'NO DEVOLVER' })),
  };
  const app = createApp({ users, ...(unavailable ? {} : { hallazgoStorage: storage }),
    sessionMiddleware: session({ secret: 'secreto-ficticio-solo-de-pruebas-mas-de-32', resave: false, saveUninitialized: false }),
  });
  const agent = request.agent(app);
  await agent.post('/api/auth/login').send({ email: user.email, password: 'Prueba1234' });
  return { app, agent, storage, user };
}

function post(agent, body = data, { files = [png], mime = 'image/png', field = 'imagenes' } = {}) {
  let req = agent.post('/api/hallazgos').set('Origin', 'http://localhost:5173').field('datos', typeof body === 'string' ? body : JSON.stringify(body));
  for (const file of files) req = req.attach(field, file, { filename: '../../nombre-no-fiable.png', contentType: mime });
  return req;
}

describe('SCRUM-49: publicación HTTP de hallazgos', () => {
  it('sin sesión rechaza antes de procesar archivos', async () => {
    const { app } = await fixture();
    expect((await request(app).post('/api/hallazgos').send({})).status).toBe(401);
    expect((await request(app).get('/api/hallazgos/opciones')).status).toBe(401);
  });
  it.each(['USUARIO', 'CONSERJE', 'ADMINISTRADOR'])('SCRUM-103: el rol %s puede obtener opciones y publicar', async (role) => {
    const { agent, storage } = await fixture({ role });
    expect((await agent.get('/api/hallazgos/opciones')).status).toBe(200);
    expect((await post(agent)).status).toBe(201);
    expect(storage.publish).toHaveBeenCalledOnce();
  });
  it('una cuenta desactivada tras iniciar sesión ya no publica', async () => {
    const { agent, user, storage } = await fixture();
    user.activo = false;
    expect((await post(agent)).status).toBe(401);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('si el almacenamiento no reconoce la cuenta, no publica', async () => {
    const { agent, storage } = await fixture({ context: null });
    expect((await post(agent)).status).toBe(403);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it.each([
    [{ facultades: [{ id: faculty, activo: false }], categorias: [{ id: category, activo: true }] }, 'facultadId'],
    [{ facultades: [], categorias: [{ id: category, activo: true }] }, 'facultadId'],
  ])('rechaza facultad inexistente o inactiva', async (context, field) => {
    const { agent, storage } = await fixture({ context });
    const result = await post(agent);
    expect(result.status).toBe(400);
    expect(result.body.errors).toHaveProperty(field);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('opciones solo devuelve facultades y categorías activas, sin campos privados', async () => {
    const { agent } = await fixture({ context: { facultades: [{ id: faculty, nombre: 'Ficticia', activo: true, secreto: 'privado' }, { id: 'inactiva', activo: false }], categorias: [{ id: category, nombre: 'Activa', activo: true, secreto: 'privado' }, { id: 'inactiva', activo: false }] } });
    const result = await agent.get('/api/hallazgos/opciones');
    expect(result.status).toBe(200);
    expect(result.body).toEqual({ facultades: [{ id: faculty, nombre: 'Ficticia' }], categorias: [{ id: category, nombre: 'Activa' }] });
  });
  it('acepta PNG real, fija autor y estado y nunca devuelve datos privados', async () => {
    const { agent, storage, user } = await fixture();
    const result = await post(agent);
    expect(result.status).toBe(201);
    expect(result.body).toEqual({ message: 'Hallazgo publicado correctamente.', hallazgo: { id: 'nuevo-hallazgo', estado: 'Activo' } });
    const saved = storage.publish.mock.calls[0][0];
    expect(saved).toMatchObject({ ...data, autorId: user.id, facultadId: faculty, estado: 'Activo' });
    expect(saved.imagenes[0].mime).toBe('image/png');
    expect(saved.imagenes[0].buffer).toBeInstanceOf(Buffer);
    expect(saved.imagenes[0]).not.toHaveProperty('originalname');
  });
  it('acepta JPG real y hasta cinco imágenes', async () => {
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { files: Array(5).fill(jpg), mime: 'image/jpeg' })).status).toBe(201);
    expect(storage.publish.mock.calls[0][0].imagenes).toHaveLength(5);
  });
  it.each([
    ['descripcion', ''], ['descripcion', 'a'.repeat(2001)], ['categoriaId', 'incorrecta'],
    ['fechaHallazgo', '2026-02-30'], ['fechaHallazgo', '2999-01-01'], ['fechaHallazgo', 'no-fecha'],
    ['latitud', 91], ['latitud', -91], ['latitud', '0'], ['longitud', 181], ['longitud', -181], ['longitud', null],
    ['puntoEntrega', 42], ['rasgosPrivados', 'a'.repeat(2001)], ['autorId', 'otro'], ['facultadId', 'otra'], ['facultadId', undefined], ['estado', 'Devuelto'],
  ])('rechaza %s inválido sin guardar nada', async (field, value) => {
    const { agent, storage } = await fixture();
    expect((await post(agent, { ...data, [field]: value })).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('rechaza categoría inexistente o inactiva', async () => {
    const { agent, storage } = await fixture({ context: { facultades: [{ id: faculty, activo: true }], categorias: [{ id: category, activo: false }] } });
    expect((await post(agent)).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it.each(['{', 'null', '[]'])('rechaza datos JSON incorrectos: %s', async body => {
    const { agent, storage } = await fixture();
    expect((await post(agent, body)).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('exige multipart y rechaza peticiones de otro origen', async () => {
    const { agent } = await fixture();
    expect((await agent.post('/api/hallazgos').set('Origin', 'http://localhost:5173').send(data)).status).toBe(415);
    expect((await agent.post('/api/hallazgos').set('Origin', 'https://ajeno.example.com').send(data)).status).toBe(403);
  });
  it.each([0, 6])('rechaza %s imágenes sin llamar al almacenamiento', async count => {
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { files: Array(count).fill(png) })).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('rechaza archivos en un campo distinto de imagenes', async () => {
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { field: 'otro' })).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('rechaza imágenes que superan 5 MiB', async () => {
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { files: [Buffer.alloc(HALLAZGO_MAX_IMAGE_BYTES + 1)] })).status).toBe(413);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it.each([
    ['imagen falsa', 'image/png'], ['<svg></svg>', 'image/svg+xml'], ['', 'image/png'],
  ])('rechaza contenido inválido o MIME no permitido', async (content, mime) => {
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { files: [Buffer.from(content)], mime })).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('rechaza formato real distinto del MIME declarado', async () => {
    const { agent } = await fixture();
    expect((await post(agent, data, { files: [jpg] })).status).toBe(400);
  });
  it('no guarda parcialmente si la segunda imagen es inválida', async () => {
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { files: [png, Buffer.from('no-imagen')] })).status).toBe(400);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('elimina metadatos de las imágenes antes de entregarlas al almacenamiento', async () => {
    const input = await sharp(jpg).withExif({ IFD0: { Artist: 'Autor ficticio' } }).toBuffer();
    const { agent, storage } = await fixture();
    expect((await post(agent, data, { files: [input], mime: 'image/jpeg' })).status).toBe(201);
    const metadata = await sharp(storage.publish.mock.calls[0][0].imagenes[0].buffer).metadata();
    expect(metadata.exif).toBeUndefined();
  });
  it('sin almacenamiento configurado devuelve 503, nunca éxito ficticio', async () => {
    const { agent } = await fixture({ unavailable: true });
    expect((await post(agent)).status).toBe(503);
    expect((await agent.get('/api/hallazgos/opciones')).status).toBe(503);
  });
  it('un fallo de persistencia no responde 201 ni filtra detalles', async () => {
    const { agent, storage } = await fixture();
    storage.publish.mockRejectedValueOnce(new Error('secreto SQL ficticio'));
    const result = await post(agent);
    expect(result.status).toBe(500);
    expect(JSON.stringify(result.body)).not.toContain('secreto SQL');
  });
});
