import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import argon2 from 'argon2';
import session from 'express-session';
import { createApp } from '../src/app.js';

// Repositorio en memoria; sesión y Argon2 reales. Solo datos ficticios.
const password = 'Prueba1234';
let passwordHash;
beforeAll(async () => { passwordHash = await argon2.hash(password, { type: argon2.argon2id }); });

function fixture({ users: overrides = {} } = {}) {
  const rows = new Map();
  const add = (row) => rows.set(row.id, { rol: 'USUARIO', activo: true, telefono: null, password_hash: passwordHash, ...row });
  add({ id: '11111111-1111-4111-8111-111111111111', email: 'ana@example.com', nombre: 'Ana', apellidos: 'Ficticia Uno' });
  add({ id: '22222222-2222-4222-8222-222222222222', email: 'beto@example.com', nombre: 'Beto', apellidos: 'Ficticio Dos', telefono: '600000000' });
  const byEmail = (email) => [...rows.values()].find((row) => row.email === email) ?? null;
  const users = {
    findByEmail: async (email) => byEmail(email),
    findById: async (id) => rows.get(id) ?? null,
    updateProfile: vi.fn(async (id, changes) => {
      const row = rows.get(id);
      if (!row) return null;
      Object.assign(row, changes);
      return row;
    }),
    ...overrides,
  };
  const sessionMiddleware = session({ secret: 'clave-ficticia-solo-para-pruebas-de-perfil', resave: false, saveUninitialized: false });
  const app = createApp({ users, sessionMiddleware, loginLimit: 100 });
  const ana = () => rows.get('11111111-1111-4111-8111-111111111111');
  return { app, rows, users, ana };
}

async function loggedIn(app, email = 'ana@example.com') {
  const agent = request.agent(app);
  const result = await agent.post('/api/auth/login').send({ email, password });
  expect(result.status).toBe(200);
  return agent;
}

describe('US-005: consulta del perfil', () => {
  it('401 sin sesión, tanto al consultar como al modificar', async () => {
    const { app, users } = fixture();
    expect((await request(app).get('/api/profile/me')).body).toEqual({ message: 'Debes iniciar sesión.' });
    expect((await request(app).get('/api/profile/me')).status).toBe(401);
    expect((await request(app).patch('/api/profile/me').send({ nombre: 'Intruso' })).status).toBe(401);
    expect(users.updateProfile).not.toHaveBeenCalled();
  });

  it('200 con los datos del propietario, sin hash ni estado interno', async () => {
    const { app } = fixture();
    const result = await (await loggedIn(app)).get('/api/profile/me');
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      id: '11111111-1111-4111-8111-111111111111', email: 'ana@example.com',
      nombre: 'Ana', apellidos: 'Ficticia Uno', telefono: null, rol: 'USUARIO',
    });
    expect(JSON.stringify(result.body)).not.toContain(passwordHash);
    expect(result.headers['cache-control']).toBe('no-store');
  });

  it('cada sesión solo ve su propio perfil', async () => {
    const { app } = fixture();
    const result = await (await loggedIn(app, 'beto@example.com')).get('/api/profile/me');
    expect(result.body.email).toBe('beto@example.com');
    expect(result.body.telefono).toBe('600000000');
  });

  it('una cuenta desactivada pierde el acceso aunque conserve la cookie', async () => {
    const { app, ana } = fixture();
    const agent = await loggedIn(app);
    ana().activo = false;
    expect((await agent.get('/api/profile/me')).status).toBe(401);
    // La sesión se destruye: reactivar la cuenta no la resucita.
    ana().activo = true;
    expect((await agent.get('/api/profile/me')).status).toBe(401);
  });
});

describe('US-005: actualización del perfil', () => {
  it('actualiza nombre y apellidos recortados, conservando identidad y rol', async () => {
    const { app, ana } = fixture();
    const result = await (await loggedIn(app)).patch('/api/profile/me').send({ nombre: '  Ana María ', apellidos: 'Nueva Ficticia' });
    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      message: 'Perfil actualizado correctamente',
      profile: expect.objectContaining({ nombre: 'Ana María', apellidos: 'Nueva Ficticia', email: 'ana@example.com', rol: 'USUARIO' }),
    });
    expect(ana()).toMatchObject({ id: '11111111-1111-4111-8111-111111111111', email: 'ana@example.com', rol: 'USUARIO', activo: true });
  });

  it.each(['612345678', '+34612345678', '912345678', ' 612345678 '])('acepta el teléfono %j', async (telefono) => {
    const { app, ana } = fixture();
    const result = await (await loggedIn(app)).patch('/api/profile/me').send({ telefono });
    expect(result.status).toBe(200);
    expect(ana().telefono).toBe(telefono.trim());
  });

  it.each(['12345', '6123456789', '+441234567890', '+3461234567', 'abc123', '612 345 678', '', 612345678, ['612345678']])(
    'rechaza el teléfono %j sin modificar nada',
    async (telefono) => {
      const { app, users } = fixture();
      const result = await (await loggedIn(app)).patch('/api/profile/me').send({ telefono });
      expect(result.status).toBe(400);
      expect(result.body.message).toBe('Los datos del perfil no son válidos.');
      expect(result.body.errors.telefono).toBe('Introduce 9 cifras, con el prefijo +34 opcional.');
      expect(users.updateProfile).not.toHaveBeenCalled();
    },
  );

  it('telefono null elimina el teléfono y omitirlo lo conserva', async () => {
    const { app, rows } = fixture();
    const agent = await loggedIn(app, 'beto@example.com');
    const beto = () => rows.get('22222222-2222-4222-8222-222222222222');
    await agent.patch('/api/profile/me').send({ nombre: 'Beto' });
    expect(beto().telefono).toBe('600000000');
    const result = await agent.patch('/api/profile/me').send({ telefono: null });
    expect(result.status).toBe(200);
    expect(result.body.profile.telefono).toBeNull();
    expect(beto().telefono).toBeNull();
  });

  it.each([
    [{ nombre: '' }, 'nombre'], [{ nombre: '   ' }, 'nombre'], [{ nombre: null }, 'nombre'],
    [{ apellidos: '' }, 'apellidos'], [{ nombre: 'a'.repeat(101) }, 'nombre'], [{ apellidos: 'a'.repeat(151) }, 'apellidos'],
  ])('400 para %j', async (body, field) => {
    const { app, users } = fixture();
    const result = await (await loggedIn(app)).patch('/api/profile/me').send(body);
    expect(result.status).toBe(400);
    expect(result.body.errors[field]).toBeDefined();
    expect(users.updateProfile).not.toHaveBeenCalled();
  });

  it.each(['email', 'rol', 'id', 'activo', 'password', 'password_hash'])('rechaza modificar %s', async (field) => {
    const { app, ana, users } = fixture();
    const before = { ...ana() };
    const result = await (await loggedIn(app)).patch('/api/profile/me').send({ nombre: 'Ana', [field]: 'ADMINISTRADOR' });
    expect(result.status).toBe(400);
    expect(result.body.errors[field]).toBe('Este campo no se puede modificar desde el perfil.');
    expect(users.updateProfile).not.toHaveBeenCalled();
    expect(ana()).toEqual(before);
  });

  it('400 si no se indica ningún campo o el cuerpo no es un objeto', async () => {
    const { app } = fixture();
    const agent = await loggedIn(app);
    expect((await agent.patch('/api/profile/me').send({})).status).toBe(400);
    expect((await agent.patch('/api/profile/me').send([])).status).toBe(400);
  });

  it('modificar un perfil no altera el de otro usuario', async () => {
    const { app, ana } = fixture();
    await (await loggedIn(app, 'beto@example.com')).patch('/api/profile/me').send({ nombre: 'Cambiado' });
    expect(ana().nombre).toBe('Ana');
  });

  it('rechaza formatos distintos de JSON', async () => {
    const { app } = fixture();
    expect((await (await loggedIn(app)).patch('/api/profile/me').type('form').send({ nombre: 'Ana' })).status).toBe(415);
  });

  it('500 genérico sin filtrar errores de persistencia', async () => {
    const { app } = fixture({ users: { updateProfile: async () => { throw new Error('clave-secreta-de-db'); } } });
    const result = await (await loggedIn(app)).patch('/api/profile/me').send({ nombre: 'Ana' });
    expect(result.status).toBe(500);
    expect(result.body).toEqual({ message: 'No se ha podido completar la operación.' });
  });
});
