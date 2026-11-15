import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import session from 'express-session';
import { hashPassword } from '../src/security/passwords.js';
import { createApp } from '../src/app.js';
import { validateAviso } from '../src/validation/avisos.js';

const USER = '33333333-3333-4333-8333-333333333333';
const CATEGORY = '11111111-1111-4111-8111-111111111111';
const FACULTY = '22222222-2222-4222-8222-222222222222';
const ID = '44444444-4444-4444-8444-444444444444';
const CENTRO = '55555555-5555-4555-8555-555555555555';
const valid = () => ({ categoriaId: CATEGORY, facultadId: FACULTY,
  descripcion: '  Mochila ficticia perdida  ', fechaPerdida: '2026-01-15' });
let passwordHash;
beforeAll(async () => { passwordHash = await hashPassword('Prueba1234'); });

async function fixture({ login = true, unavailable = false } = {}) {
  const user = { id: USER, email: 'persona@example.com', password_hash: passwordHash, rol: 'USUARIO', activo: true };
  const storage = {
    options: vi.fn(async () => ({
      categorias: [{ id: CATEGORY, nombre: 'Mochilas', privado: 'secreto' }],
      facultades: [{ id: FACULTY, nombre: 'Facultad ficticia' }],
      centros: [{ id: CENTRO, nombre: 'Centro ficticio', facultadId: FACULTY, otro: 'secreto' }],
    })),
    publish: vi.fn(async () => ({ id: ID, rasgos: 'secreto', email: user.email })),
  };
  const app = createApp({ users: { findByEmail: async () => user, findById: async () => user },
    ...(unavailable ? {} : { avisoStorage: storage }), avisoLimit: 2,
    sessionMiddleware: session({ secret: 'secreto-ficticio-avisos-largo-mas-de-32', resave: false, saveUninitialized: false }) });
  const agent = request.agent(app);
  if (login) expect((await agent.post('/api/auth/login').send({ email: user.email, password: 'Prueba1234' })).status).toBe(200);
  const publish = body => agent.post('/api/avisos').set('Origin', 'http://localhost:5173').send(body);
  return { agent, storage, user, publish };
}

describe('SCRUM-109: validación del aviso', () => {
  it('normaliza textos y permite no aportar contacto ni rasgos privados', () => {
    expect(validateAviso(valid())).toEqual({ errors: {}, value: {
      categoriaId: CATEGORY, facultadId: FACULTY, centroId: null, descripcion: 'Mochila ficticia perdida',
      fechaPerdida: '2026-01-15', rasgosPrivados: null, contactoEmail: null, contactoTelefono: null,
    } });
  });
  it('permite seleccionar solo un centro, sin inventar una facultad en el cliente', () => {
    expect(validateAviso({ ...valid(), facultadId: '', centroId: CENTRO }).errors).toEqual({});
  });
  it('acepta textos de 2000 caracteres y contacto voluntario válido', () => {
    expect(validateAviso({ ...valid(), descripcion: 'a'.repeat(2000), rasgosPrivados: 'a'.repeat(2000),
      contactoEmail: ' contacto@example.com ', contactoTelefono: ' +34600000000 ' }).errors).toEqual({});
  });
  it.each([
    [{ categoriaId: '' }, 'categoriaId'], [{ categoriaId: 'x' }, 'categoriaId'],
    [{ categoriaId: {} }, 'categoriaId'], [{ facultadId: '' }, 'facultadId'],
    [{ facultadId: 'x' }, 'facultadId'], [{ centroId: 'x' }, 'centroId'],
    [{ descripcion: '  ' }, 'descripcion'], [{ descripcion: 123 }, 'descripcion'],
    [{ descripcion: 'a'.repeat(2001) }, 'descripcion'], [{ rasgosPrivados: [] }, 'rasgosPrivados'],
    [{ rasgosPrivados: 'a'.repeat(2001) }, 'rasgosPrivados'],
    [{ fechaPerdida: '2026-02-30' }, 'fechaPerdida'], [{ fechaPerdida: '2026-13-01' }, 'fechaPerdida'],
    [{ fechaPerdida: '0000-01-01' }, 'fechaPerdida'], [{ fechaPerdida: '2999-01-01' }, 'fechaPerdida'],
    [{ fechaPerdida: '' }, 'fechaPerdida'], [{ fechaPerdida: {} }, 'fechaPerdida'],
    [{ contactoEmail: 'x' }, 'contactoEmail'], [{ contactoEmail: {} }, 'contactoEmail'],
    [{ contactoTelefono: '123' }, 'contactoTelefono'], [{ contactoTelefono: 600000000 }, 'contactoTelefono'],
    [{ autorId: USER }, 'aviso'], [{ estado: 'Cerrado' }, 'aviso'], [{ foto: 'x' }, 'aviso'],
  ])('rechaza %o sin aceptar identidad/estado del cliente', (changes, field) => {
    expect(validateAviso({ ...valid(), ...changes }).errors).toHaveProperty(field);
  });
  it.each([null, [], 'texto', 12])('rechaza cuerpos distintos de un objeto: %s', body => {
    expect(validateAviso(body).errors).toHaveProperty('aviso');
  });
});

describe('SCRUM-109: contrato HTTP', () => {
  it('sin sesión no permite publicar ni consultar opciones', async () => {
    const { agent, publish, storage } = await fixture({ login: false });
    expect((await publish(valid())).status).toBe(401);
    expect((await agent.get('/api/avisos/opciones')).status).toBe(401);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('publica con autor de sesión y responde solo id y estado', async () => {
    const { publish, storage } = await fixture();
    const result = await publish({ ...valid(), rasgosPrivados: 'Llave oculta', contactoEmail: 'contacto@example.com' });
    expect(result.status).toBe(201);
    expect(result.body).toEqual({ message: 'Aviso de pérdida publicado correctamente.', aviso: { id: ID, estado: 'Activo' } });
    expect(result.headers['cache-control']).toBe('no-store');
    expect(storage.publish).toHaveBeenCalledWith(USER, expect.objectContaining({ descripcion: 'Mochila ficticia perdida',
      rasgosPrivados: 'Llave oculta', contactoEmail: 'contacto@example.com' }));
    expect(JSON.stringify(result.body)).not.toContain('secreto');
  });
  it('facilita categorías, facultades y centros sin campos internos', async () => {
    const { agent } = await fixture();
    expect((await agent.get('/api/avisos/opciones')).body).toEqual({
      categorias: [{ id: CATEGORY, nombre: 'Mochilas' }], facultades: [{ id: FACULTY, nombre: 'Facultad ficticia' }],
      centros: [{ id: CENTRO, nombre: 'Centro ficticio', facultadId: FACULTY }],
    });
  });
  it('400 incluye los errores para los controles del formulario y no guarda nada', async () => {
    const { publish, storage } = await fixture();
    expect((await publish({ ...valid(), descripcion: '' })).body.errors).toHaveProperty('descripcion');
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('una cuenta desactivada pierde acceso con su sesión existente', async () => {
    const { publish, user, storage } = await fixture();
    user.activo = false;
    expect((await publish(valid())).status).toBe(401);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it.each([
    { Origin: 'https://ajeno.example' }, { 'Sec-Fetch-Site': 'cross-site' }, {},
  ])('rechaza peticiones sin origen autorizado: %o', async headers => {
    const { agent, storage } = await fixture();
    expect((await agent.post('/api/avisos').set(headers).send(valid())).status).toBe(403);
    expect(storage.publish).not.toHaveBeenCalled();
  });
  it('rechaza formatos no JSON, JSON mal formado y cuerpos excesivos', async () => {
    const { agent } = await fixture();
    const post = () => agent.post('/api/avisos').set('Origin', 'http://localhost:5173');
    expect((await post().type('form').send({ descripcion: 'x' })).status).toBe(415);
    expect((await post().type('json').send('{mal')).status).toBe(400);
    // Otra sesión/app evita que el rate limit esconda la comprobación de tamaño.
    const other = await fixture();
    expect((await other.publish({ ...valid(), descripcion: 'a'.repeat(33000) })).status).toBe(413);
  });
  it('limita publicaciones repetidas', async () => {
    const { publish } = await fixture();
    expect((await publish(valid())).status).toBe(201);
    expect((await publish(valid())).status).toBe(201);
    expect((await publish(valid())).status).toBe(429);
  });
  it('sin almacenamiento real responde 503, sin simular éxito', async () => {
    const { publish } = await fixture({ unavailable: true });
    expect((await publish(valid())).status).toBe(503);
  });
  it('un error interno no expone SQL, contactos ni credenciales', async () => {
    const { publish, storage } = await fixture();
    storage.publish.mockRejectedValueOnce(new Error('SQL secreto contacto@example.com'));
    const result = await publish(valid());
    expect(result.status).toBe(500);
    expect(result.body).toEqual({ message: 'No se ha podido completar la operación.' });
  });
});
