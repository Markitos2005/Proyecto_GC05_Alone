import { describe, it, expect } from 'vitest';
import request from 'supertest';
import argon2 from 'argon2';
import session from 'express-session';
import { createApp } from '../src/app.js';

async function fixture() {
  const email = 'persona@example.com';
  const password = 'Prueba1234';

  const usuario = {
    id: '11111111-1111-4111-8111-111111111111',
    email,
    rol: 'USUARIO',
    activo: true,
    password_hash: await argon2.hash(password, {
      type: argon2.argon2id,
    }),
  };

  const users = {
    findByEmail: async (buscado) =>
      buscado === email ? usuario : null,
  };

  const sessionMiddleware = session({
    name: 'lostfound.sid',
    secret: 'clave-ficticia-solo-para-pruebas-de-logout',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  });

  return {
    app: createApp({
      users,
      sessionMiddleware,
    }),
    email,
    password,
  };
}

describe('US-003: contrato de cierre de sesión', () => {
  it('401 si no existe una sesión autenticada', async () => {
    const { app } = await fixture();

    const response = await request(app)
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'No hay una sesión activa.',
    });
  });

  it('200 al cerrar una sesión iniciada', async () => {
    const { app, email, password } = await fixture();
    const agent = request.agent(app);

    const login = await agent
      .post('/api/auth/login')
      .send({ email, password });

    expect(login.status).toBe(200);

    const logout = await agent
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(logout.status).toBe(200);
    expect(logout.body).toEqual({
      message: 'Sesión cerrada correctamente.',
    });
    expect(logout.headers['cache-control']).toBe('no-store');
  });

  it('elimina la cookie al cerrar sesión', async () => {
    const { app, email, password } = await fixture();
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ email, password });

    const logout = await agent
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(logout.status).toBe(200);

    const cookies = logout.headers['set-cookie'];

    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('lostfound.sid=');
    expect(cookies[0]).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cookies[0]).toContain('HttpOnly');
    expect(cookies[0]).toContain('SameSite=Lax');
  });

  it('invalida la sesión después del cierre', async () => {
    const { app, email, password } = await fixture();
    const agent = request.agent(app);

    await agent
      .post('/api/auth/login')
      .send({ email, password });

    const firstLogout = await agent
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(firstLogout.status).toBe(200);

    const secondLogout = await agent
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(secondLogout.status).toBe(401);
    expect(secondLogout.body).toEqual({
      message: 'No hay una sesión activa.',
    });
  });

  it('no permite reutilizar la cookie de una sesión destruida', async () => {
    const { app, email, password } = await fixture();

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    expect(login.status).toBe(200);

    const originalCookie = login.headers['set-cookie'][0]
      .split(';')[0];

    const logout = await request(app)
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin')
      .set('Cookie', originalCookie);

    expect(logout.status).toBe(200);

    const retry = await request(app)
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin')
      .set('Cookie', originalCookie);

    expect(retry.status).toBe(401);
  });

  it('403 si el cierre de sesión procede de otro origen', async () => {
    const { app, email, password } = await fixture();
    const agent = request.agent(app);

    const login = await agent
      .post('/api/auth/login')
      .send({ email, password });

    expect(login.status).toBe(200);

    const intentoExterno = await agent
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'cross-site')
      .set('Origin', 'https://sitio-externo.example');

    expect(intentoExterno.status).toBe(403);
    expect(intentoExterno.body).toEqual({
      message: 'Origen de la petición no permitido.',
    });

    // El intento rechazado no debe destruir la sesión.
    const cierreLegitimo = await agent
      .post('/api/auth/logout')
      .set('Sec-Fetch-Site', 'same-origin');

    expect(cierreLegitimo.status).toBe(200);
  });
});
