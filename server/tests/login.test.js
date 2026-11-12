import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import argon2 from 'argon2';
import session from 'express-session';
import { createApp } from '../src/app.js';

// Repositorio simulado, pero verificación real con Argon2.
// El almacenamiento de sesiones en memoria se usa solo en estas pruebas.
async function fixture({
  activo = true,
  sinPassword = false,
  loginLimit = 100,
} = {}) {
  const email = 'persona@example.com';
  const password = 'Prueba1234';

  const usuario = {
    id: '11111111-1111-4111-8111-111111111111',
    email,
    rol: 'USUARIO',
    activo,
    password_hash: sinPassword
      ? null
      : await argon2.hash(password, { type: argon2.argon2id }),
  };

  const users = {
    findByEmail: vi.fn(async (buscado) =>
      buscado === email ? usuario : null
    ),
  };

  const sessionMiddleware = session({
    secret: 'clave-ficticia-solo-para-pruebas-de-login',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  const app = createApp({
    users,
    sessionMiddleware,
    loginLimit,
  });

  return { app, users, usuario, email, password };
}

describe('US-002: contrato de inicio de sesión', () => {
  it('200, autentica con Argon2 y devuelve datos públicos', async () => {
    const { app, email, password, usuario } = await fixture();

    const result = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(result.status).toBe(200);
    expect(result.body).toEqual({
      message: 'Inicio de sesión correcto.',
      user: {
        id: usuario.id,
        email,
        rol: 'USUARIO',
      },
    });

    expect(result.headers['set-cookie']).toBeDefined();
    expect(result.headers['cache-control']).toBe('no-store');

    const respuesta = JSON.stringify(result.body);
    expect(respuesta).not.toContain(usuario.password_hash);
    expect(respuesta).not.toContain(password);
  });

  it('normaliza el correo sin modificar la contraseña', async () => {
    const { app, users, email, password } = await fixture();

    const result = await request(app)
      .post('/api/auth/login')
      .send({
        email: ' Persona@EXAMPLE.COM ',
        password,
      });

    expect(result.status).toBe(200);
    expect(users.findByEmail).toHaveBeenCalledWith(email);
  });

  it('401 para una contraseña incorrecta', async () => {
    const { app, email } = await fixture();

    const result = await request(app)
      .post('/api/auth/login')
      .send({
        email,
        password: 'Incorrecta123',
      });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      message: 'Correo o contraseña incorrectos.',
    });
    expect(result.headers['set-cookie']).toBeUndefined();
  });

  it('401 para un correo inexistente', async () => {
    const { app } = await fixture();

    const result = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'noexiste@example.com',
        password: 'Prueba1234',
      });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      message: 'Correo o contraseña incorrectos.',
    });
  });

  it('401 para una cuenta desactivada', async () => {
    const { app, email, password } = await fixture({
      activo: false,
    });

    const result = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      message: 'Correo o contraseña incorrectos.',
    });
  });

  it('401 para una cuenta sin contraseña local', async () => {
    const { app, email, password } = await fixture({
      sinPassword: true,
    });

    const result = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(result.status).toBe(401);
    expect(result.body).toEqual({
      message: 'Correo o contraseña incorrectos.',
    });
  });

  it.each([
    {},
    { email: 'persona@example.com' },
    { password: 'Prueba1234' },
    { email: '', password: 'Prueba1234' },
    { email: 'persona@example.com', password: '' },
    { email: 123, password: 'Prueba1234' },
    { email: 'persona@example.com', password: 123 },
  ])('400 para datos inválidos: %j', async (body) => {
    const { app } = await fixture();

    const result = await request(app)
      .post('/api/auth/login')
      .send(body);

    expect(result.status).toBe(400);
    expect(result.headers['set-cookie']).toBeUndefined();
  });

  it('rechaza formatos distintos de JSON', async () => {
    const { app, email, password } = await fixture();

    const result = await request(app)
      .post('/api/auth/login')
      .type('form')
      .send({ email, password });

    expect(result.status).toBe(415);
  });

  it('limita los intentos de inicio de sesión', async () => {
    const { app, email } = await fixture({
      loginLimit: 1,
    });

    await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Incorrecta123' });

    const result = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'Incorrecta123' });

    expect(result.status).toBe(429);
  });
});
