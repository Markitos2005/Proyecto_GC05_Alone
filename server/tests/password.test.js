import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import argon2 from 'argon2';
import session from 'express-session';
import { createApp } from '../src/app.js';

// SCRUM-45 / US-006. Repositorio en memoria; sesión y Argon2 reales. Solo datos ficticios.
const actual = 'Prueba1234';
const nueva = 'Distinta5678';
const ANA = '11111111-1111-4111-8111-111111111111';
let actualHash;
beforeAll(async () => { actualHash = await argon2.hash(actual, { type: argon2.argon2id }); });

function fixture({ passwordHash, passwordLimit = 100 } = {}) {
  const rows = new Map();
  rows.set(ANA, {
    id: ANA, email: 'ana@example.com', nombre: 'Ana', apellidos: 'Ficticia Uno', telefono: null,
    rol: 'USUARIO', activo: true, password_hash: passwordHash === undefined ? actualHash : passwordHash,
    intentos_contrasena_fallidos: 0, bloqueada_hasta: 0,
  });
  const byEmail = (email) => [...rows.values()].find((row) => row.email === email) ?? null;
  // Imita el contador y el bloqueo del repositorio real (ver postgres.test.js).
  const users = {
    findByEmail: async (email) => byEmail(email),
    findById: async (id) => rows.get(id) ?? null,
    findCredentialsById: async (id) => {
      const row = rows.get(id);
      return row ? { ...row, bloqueada: row.bloqueada_hasta > Date.now() } : null;
    },
    registerFailedPasswordAttempt: vi.fn(async (id, { maxAttempts, lockSeconds }) => {
      const row = rows.get(id);
      row.intentos_contrasena_fallidos += 1;
      if (row.intentos_contrasena_fallidos >= maxAttempts) {
        row.intentos_contrasena_fallidos = 0;
        row.bloqueada_hasta = Date.now() + lockSeconds * 1000;
      }
      return { bloqueada: row.bloqueada_hasta > Date.now() };
    }),
    resetFailedPasswordAttempts: vi.fn(async (id) => {
      Object.assign(rows.get(id), { intentos_contrasena_fallidos: 0, bloqueada_hasta: 0 });
    }),
    changePassword: vi.fn(async ({ id, passwordHash: hash }) => {
      const row = rows.get(id);
      if (!row) return null;
      Object.assign(row, { password_hash: hash, intentos_contrasena_fallidos: 0, bloqueada_hasta: 0 });
      return { sesionesCerradas: 0 };
    }),
  };
  const sessionMiddleware = session({ secret: 'clave-ficticia-solo-para-pruebas-de-contrasena', resave: false, saveUninitialized: false });
  const app = createApp({ users, sessionMiddleware, loginLimit: 100, passwordLimit });
  return { app, users, ana: () => rows.get(ANA) };
}

async function loggedIn(app, password = actual) {
  const agent = request.agent(app);
  const result = await agent.post('/api/auth/login').send({ email: 'ana@example.com', password });
  expect(result.status).toBe(200);
  return agent;
}

const change = (agent, body) => agent.post('/api/profile/me/password').set('Sec-Fetch-Site', 'same-origin').send(body);
const valid = { actual, nueva, confirmacion: nueva };

describe('SCRUM-45: protección del endpoint', () => {
  it('401 sin sesión', async () => {
    const { app, users } = fixture();
    const result = await change(request(app), valid);
    expect(result.status).toBe(401);
    expect(users.changePassword).not.toHaveBeenCalled();
  });

  it('403 si la petición viene de otro sitio', async () => {
    const { app, users } = fixture();
    const agent = await loggedIn(app);
    const result = await agent.post('/api/profile/me/password').set('Origin', 'https://otro-sitio.example').send(valid);
    expect(result.status).toBe(403);
    expect(users.changePassword).not.toHaveBeenCalled();
  });

  it('415 si no se envía JSON', async () => {
    const { app } = fixture();
    const agent = await loggedIn(app);
    const result = await agent.post('/api/profile/me/password').set('Sec-Fetch-Site', 'same-origin')
      .type('form').send('actual=a&nueva=b&confirmacion=b');
    expect(result.status).toBe(415);
  });
});

describe('SCRUM-45: validación (AC-02, AC-03, AC-04)', () => {
  it.each([
    ['faltan todos los campos', {}, {
      actual: 'Introduce tu contraseña actual.',
      nueva: 'Introduce la nueva contraseña.',
      confirmacion: 'Repite la nueva contraseña.',
    }],
    ['la confirmación no coincide', { actual, nueva, confirmacion: 'Otra9999x' }, { confirmacion: 'Las contraseñas nuevas no coinciden.' }],
    ['la nueva es débil (mismas reglas que el registro)', { actual, nueva: 'corta1', confirmacion: 'corta1' }, { nueva: 'Usa al menos 8 caracteres, una letra y un número.' }],
    ['la nueva no tiene números', { actual, nueva: 'SoloLetras', confirmacion: 'SoloLetras' }, { nueva: 'Usa al menos 8 caracteres, una letra y un número.' }],
    ['la nueva supera 128 caracteres', { actual, nueva: `a1${'x'.repeat(127)}`, confirmacion: `a1${'x'.repeat(127)}` }, { nueva: 'La contraseña no puede superar los 128 caracteres.' }],
    ['se intenta cambiar otro campo', { ...valid, email: 'otro@example.com' }, { email: 'Este campo no se admite.' }],
    ['los campos no son texto', { actual: 1234, nueva: ['x'], confirmacion: null }, {
      actual: 'Introduce tu contraseña actual.',
      nueva: 'Introduce la nueva contraseña.',
      confirmacion: 'Repite la nueva contraseña.',
    }],
  ])('400 si %s', async (_caso, body, errors) => {
    const { app, users } = fixture();
    const result = await change(await loggedIn(app), body);
    expect(result.status).toBe(400);
    expect(result.body).toEqual({ message: 'Los datos del cambio de contraseña no son válidos.', errors });
    expect(users.changePassword).not.toHaveBeenCalled();
  });

  it('400 si el cuerpo es un array', async () => {
    const { app } = fixture();
    const result = await change(await loggedIn(app), [valid]);
    expect(result.status).toBe(400);
    expect(result.body.errors).toEqual({ cambio: 'Envía la contraseña actual y la nueva.' });
  });

  it('400 si la nueva es igual a la guardada', async () => {
    const { app, users } = fixture();
    const result = await change(await loggedIn(app), { actual, nueva: actual, confirmacion: actual });
    expect(result.status).toBe(400);
    expect(result.body.errors).toEqual({ nueva: 'La nueva contraseña debe ser distinta de la actual.' });
    expect(users.changePassword).not.toHaveBeenCalled();
  });
});

describe('SCRUM-45: cambio correcto (AC-05, AC-06, AC-10)', () => {
  it('guarda un hash Argon2id nuevo y conserva la sesión actual', async () => {
    const { app, users, ana } = fixture();
    const agent = await loggedIn(app);
    const result = await change(agent, valid);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ message: 'Contraseña actualizada correctamente. Se han cerrado tus demás sesiones abiertas.' });
    expect(result.headers['cache-control']).toBe('no-store');

    const stored = ana().password_hash;
    expect(stored).toMatch(/^\$argon2id\$/);
    expect(await argon2.verify(stored, nueva)).toBe(true);
    expect(await argon2.verify(stored, actual)).toBe(false);

    // Se pide conservar exactamente la sesión de esta petición; el resto se cierra en el repositorio.
    const [[call]] = users.changePassword.mock.calls;
    expect(call.id).toBe(ANA);
    expect(typeof call.keepSessionId).toBe('string');
    expect(call.keepSessionId.length).toBeGreaterThan(0);

    // La sesión actual sigue funcionando.
    expect((await agent.get('/api/profile/me')).status).toBe(200);
  });

  it('la contraseña anterior deja de servir para iniciar sesión', async () => {
    const { app } = fixture();
    await change(await loggedIn(app), valid);
    expect((await request(app).post('/api/auth/login').send({ email: 'ana@example.com', password: actual })).status).toBe(401);
    expect((await request(app).post('/api/auth/login').send({ email: 'ana@example.com', password: nueva })).status).toBe(200);
  });

  it('ninguna respuesta incluye contraseñas ni hashes', async () => {
    const { app, ana } = fixture();
    const agent = await loggedIn(app);
    const responses = [
      await change(agent, { actual, nueva: 'corta1', confirmacion: 'corta1' }),
      await change(agent, valid),
    ];
    for (const response of responses) {
      const text = JSON.stringify(response.body);
      for (const secret of [actual, nueva, 'corta1', actualHash, ana().password_hash]) {
        expect(text).not.toContain(secret);
      }
    }
  });
});

const LOCKED = { message: 'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.' };
const wrong = { actual: 'Incorrecta999', nueva, confirmacion: nueva };

describe('SCRUM-99: contraseña actual (AC-03)', () => {
  it('400 si la contraseña actual es incorrecta y no cambia nada', async () => {
    const { app, users, ana } = fixture();
    const result = await change(await loggedIn(app), wrong);
    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      message: 'Los datos del cambio de contraseña no son válidos.',
      errors: { actual: 'La contraseña actual no es correcta.' },
    });
    expect(users.changePassword).not.toHaveBeenCalled();
    expect(ana().password_hash).toBe(actualHash);
  });
});

describe('SCRUM-99: límite de intentos fallidos consecutivos (AC-07)', () => {
  it('bloquea la opción al quinto fallo consecutivo, incluso con la contraseña correcta', async () => {
    const { app, users } = fixture();
    const agent = await loggedIn(app);
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      expect((await change(agent, wrong)).status).toBe(400);
    }
    const fifth = await change(agent, wrong);
    expect(fifth.status).toBe(429);
    expect(fifth.body).toEqual(LOCKED);

    const meanwhile = await change(agent, valid);
    expect(meanwhile.status).toBe(429);
    expect(users.changePassword).not.toHaveBeenCalled();
  });

  it('cuenta los fallos por cuenta: iniciar otra sesión no reinicia el contador', async () => {
    const { app } = fixture();
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      expect((await change(await loggedIn(app), wrong)).status).toBe(400);
    }
    expect((await change(await loggedIn(app), wrong)).status).toBe(429);
  });

  it('un acierto con la contraseña actual reinicia la racha de fallos', async () => {
    const { app, users } = fixture();
    const agent = await loggedIn(app);
    for (let attempt = 1; attempt <= 4; attempt += 1) await change(agent, wrong);
    // Contraseña actual correcta aunque la nueva no se admita: corta la racha.
    const same = await change(agent, { actual, nueva: actual, confirmacion: actual });
    expect(same.status).toBe(400);
    expect(users.resetFailedPasswordAttempts).toHaveBeenCalledTimes(1);
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      expect((await change(agent, wrong)).status).toBe(400);
    }
  });

  it('al terminar el bloqueo se puede cambiar con la contraseña correcta', async () => {
    const { app, ana } = fixture();
    const agent = await loggedIn(app);
    for (let attempt = 1; attempt <= 5; attempt += 1) await change(agent, wrong);
    expect((await change(agent, valid)).status).toBe(429);
    ana().bloqueada_hasta = Date.now() - 1;
    expect((await change(agent, valid)).status).toBe(200);
  });

  it('limita también las peticiones por IP', async () => {
    const { app } = fixture({ passwordLimit: 2 });
    const agent = await loggedIn(app);
    await change(agent, wrong);
    await change(agent, wrong);
    const third = await change(agent, valid);
    expect(third.status).toBe(429);
    expect(third.body).toEqual({ message: 'Demasiados intentos. Inténtalo más tarde.' });
  });
});

describe('SCRUM-45: cuentas sin contraseña local (AC-08)', () => {
  it('409 si la cuenta no tiene contraseña local', async () => {
    const { app, users, ana } = fixture();
    const agent = await loggedIn(app);
    ana().password_hash = null;
    const result = await change(agent, valid);
    expect(result.status).toBe(409);
    expect(result.body).toEqual({ message: 'Tu cuenta no utiliza una contraseña local.' });
    expect(users.changePassword).not.toHaveBeenCalled();
  });
});
