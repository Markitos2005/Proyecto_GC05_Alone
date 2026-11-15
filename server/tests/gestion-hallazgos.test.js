
import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import session from 'express-session';
import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { createApp } from '../src/app.js';
import { validateHallazgoUpdate } from '../src/validation/hallazgos.js';
import { HallazgoError } from '../src/services/hallazgos.js';

const userId = randomUUID();
const hallazgoId = randomUUID();
let passwordHash;

beforeAll(async () => {
  passwordHash = await argon2.hash('Prueba1234');
});

async function fixture() {
  const user = {
    id: userId,
    email: 'propietario@example.com',
    rol: 'USUARIO',
    activo: true,
    password_hash: passwordHash,
  };

  const users = {
    findByEmail: async () => user,
    findById: async () => user,
  };

  const storage = {
    updateOwnHallazgo: vi.fn(async (requestedUser, requestedHallazgo, changes) => {
      if (requestedUser !== userId || requestedHallazgo !== hallazgoId) {
        throw new HallazgoError(404, 'Hallazgo no encontrado.');
      }

      return {
        id: requestedHallazgo,
        estado: 'Activo',
        ...changes,
      };
    }),
    getOwnHallazgo: vi.fn(async (requestedUser, requestedHallazgo) => {
      if (requestedUser !== userId || requestedHallazgo !== hallazgoId) {
        return null;
      }

      return {
        id: hallazgoId,
        autorId: userId,
        descripcion: 'Mochila de prueba',
        estado: 'Activo',
        rasgosPrivados: 'Etiqueta interior privada',
        imagenes: [
          { id: randomUUID(), posicion: 1, mime: 'image/png' },
        ],
      };
    }),
  };

  const app = createApp({
    users,
    hallazgoStorage: storage,
    sessionMiddleware: session({
      secret: 'secreto-ficticio-solo-para-pruebas-de-gestion',
      resave: false,
      saveUninitialized: false,
    }),
  });

  const agent = request.agent(app);
  const login = await agent.post('/api/auth/login').send({
    email: user.email,
    password: 'Prueba1234',
  });

  expect(login.status).toBe(200);

  return { app, agent, storage };
}

describe('SCRUM-114 / US-010: consulta de hallazgos propios', () => {
  it('rechaza una consulta sin iniciar sesión', async () => {
    const { app } = await fixture();

    const response = await request(app).get(`/api/hallazgos/${hallazgoId}`);

    expect(response.status).toBe(401);
  });

  it('devuelve el detalle privado de un hallazgo propio', async () => {
    const { agent, storage } = await fixture();

    const response = await agent.get(`/api/hallazgos/${hallazgoId}`);

    expect(response.status).toBe(200);
    expect(response.body.hallazgo).toMatchObject({
      id: hallazgoId,
      autorId: userId,
      estado: 'Activo',
      rasgosPrivados: 'Etiqueta interior privada',
    });
    expect(response.body.hallazgo.imagenes).toHaveLength(1);
    expect(storage.getOwnHallazgo).toHaveBeenCalledWith(userId, hallazgoId);
  });

  it('devuelve 404 si el hallazgo no pertenece al usuario', async () => {
    const { agent } = await fixture();

    const response = await agent.get(`/api/hallazgos/${randomUUID()}`);

    expect(response.status).toBe(404);
    expect(response.body).not.toHaveProperty('hallazgo');
  });

  it('rechaza identificadores incorrectos', async () => {
    const { agent, storage } = await fixture();

    const response = await agent.get('/api/hallazgos/no-es-un-uuid');

    expect(response.status).toBe(400);
    expect(storage.getOwnHallazgo).not.toHaveBeenCalled();
  });
});

describe('SCRUM-114 / US-010: validación de edición', () => {
  it('permite modificar únicamente la descripción', () => {
    const result = validateHallazgoUpdate({
      descripcion: '  Mochila azul actualizada  ',
    });

    expect(result.errors).toEqual({});
    expect(result.value).toEqual({
      descripcion: 'Mochila azul actualizada',
    });
  });

  it('permite actualizar varios campos sin exigir los demás', () => {
    const result = validateHallazgoUpdate({
      latitud: 39.47,
      longitud: -6.37,
      puntoEntrega: 'Conserjería',
    });

    expect(result.errors).toEqual({});
    expect(result.value).toEqual({
      latitud: 39.47,
      longitud: -6.37,
      puntoEntrega: 'Conserjería',
    });
  });

  it.each([
    { autorId: 'otro-usuario' },
    { estado: 'Activo' },
    { id: 'otro-hallazgo' },
    {},
  ])('rechaza campos protegidos o una edición vacía', (data) => {
    const result = validateHallazgoUpdate(data);

    expect(result.errors).toHaveProperty('datos');
  });

  it.each([
    { descripcion: '' },
    { descripcion: 'a'.repeat(2001) },
    { latitud: 91 },
    { longitud: -181 },
    { fechaHallazgo: '2999-01-01' },
    { categoriaId: 'identificador-incorrecto' },
  ])('rechaza valores incorrectos', (data) => {
    const result = validateHallazgoUpdate(data);

    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });
});

describe('SCRUM-114 / US-010: endpoint de edición', () => {
  it('permite al propietario editar un hallazgo activo', async () => {
    const { agent, storage } = await fixture();

    const response = await agent
      .patch(`/api/hallazgos/${hallazgoId}`)
      .set('Origin', 'http://localhost:5173')
      .send({ descripcion: 'Mochila azul actualizada' });

    expect(response.status).toBe(200);
    expect(response.body.hallazgo).toMatchObject({
      id: hallazgoId,
      estado: 'Activo',
    });
    expect(storage.updateOwnHallazgo).toHaveBeenCalledWith(
      userId,
      hallazgoId,
      { descripcion: 'Mochila azul actualizada' },
    );
  });

  it('rechaza la edición sin iniciar sesión', async () => {
    const { app } = await fixture();

    const response = await request(app)
      .patch(`/api/hallazgos/${hallazgoId}`)
      .set('Origin', 'http://localhost:5173')
      .send({ descripcion: 'Cambio no autorizado' });

    expect(response.status).toBe(401);
  });

  it('rechaza la edición de un hallazgo ajeno', async () => {
    const { agent, storage } = await fixture();

    const response = await agent
      .patch(`/api/hallazgos/${randomUUID()}`)
      .set('Origin', 'http://localhost:5173')
      .send({ descripcion: 'Cambio no autorizado' });

    expect(response.status).toBe(404);
    expect(storage.updateOwnHallazgo).toHaveBeenCalledOnce();
  });

  it('impide modificar el autor y el estado', async () => {
    const { agent, storage } = await fixture();

    const response = await agent
      .patch(`/api/hallazgos/${hallazgoId}`)
      .set('Origin', 'http://localhost:5173')
      .send({
        descripcion: 'Intento de modificación',
        autorId: randomUUID(),
        estado: 'Devuelto',
      });

    expect(response.status).toBe(400);
    expect(storage.updateOwnHallazgo).not.toHaveBeenCalled();
  });

  it('rechaza un identificador incorrecto', async () => {
    const { agent, storage } = await fixture();

    const response = await agent
      .patch('/api/hallazgos/no-es-uuid')
      .set('Origin', 'http://localhost:5173')
      .send({ descripcion: 'Cambio' });

    expect(response.status).toBe(400);
    expect(storage.updateOwnHallazgo).not.toHaveBeenCalled();
  });
});
