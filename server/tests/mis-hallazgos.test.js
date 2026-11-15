import { beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import session from 'express-session';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';

// SCRUM-113 / US-010: listado de hallazgos propios. Solo datos ficticios; almacenamiento simulado.
const USER = '33333333-3333-4333-8333-333333333333';
const ID = '44444444-4444-4444-8444-444444444444';
const IMG = '55555555-5555-4555-8555-555555555555';
let hash;
beforeAll(async () => { hash = await argon2.hash('Prueba1234'); });

async function fixture(rows) {
  const user = { id: USER, email: 'persona@example.com', rol: 'USUARIO', activo: true, password_hash: hash };
  const storage = { listOwnHallazgos: vi.fn(async () => rows), getOwnHallazgo: vi.fn(async () => null) };
  const app = createApp({ users: { findByEmail: async () => user, findById: async () => user }, hallazgoStorage: storage,
    sessionMiddleware: session({ secret: 'secreto-ficticio-solo-de-pruebas-mas-de-32', resave: false, saveUninitialized: false }) });
  const agent = request.agent(app);
  return { app, agent, storage, login: () => agent.post('/api/auth/login').send({ email: user.email, password: 'Prueba1234' }) };
}

describe('SCRUM-113: GET /api/hallazgos/mios', () => {
  it('sin sesión responde 401', async () => {
    const { app, storage } = await fixture([]);
    expect((await request(app).get('/api/hallazgos/mios')).status).toBe(401);
    expect(storage.listOwnHallazgos).not.toHaveBeenCalled();
  });

  it('devuelve los hallazgos del usuario con la URL privada de la miniatura y sin datos de más', async () => {
    const { agent, storage, login } = await fixture([
      { id: ID, descripcion: 'Mochila ficticia', fechaHallazgo: '2026-01-15', estado: 'Retirado', categoria: 'Mochilas', facultad: 'Facultad ficticia',
        publicadoEn: '2026-11-14T10:00:00.000Z', imagenId: IMG, rasgosPrivados: 'NO DEVOLVER', autorId: USER },
      { id: 'b', descripcion: 'Sin foto', fechaHallazgo: '2026-01-01', estado: 'Activo', categoria: 'Otros', facultad: 'F', publicadoEn: 'x', imagenId: null },
    ]);
    await login();
    const result = await agent.get('/api/hallazgos/mios');
    expect(result.status).toBe(200);
    expect(storage.listOwnHallazgos).toHaveBeenCalledWith(USER);
    // «mios» no se trata como el id de un hallazgo.
    expect(storage.getOwnHallazgo).not.toHaveBeenCalled();
    expect(result.body.hallazgos[0]).toEqual({ id: ID, descripcion: 'Mochila ficticia', fechaHallazgo: '2026-01-15', estado: 'Retirado',
      categoria: 'Mochilas', facultad: 'Facultad ficticia', publicadoEn: '2026-11-14T10:00:00.000Z', imagen: `/api/hallazgos/${ID}/imagenes/${IMG}` });
    expect(result.body.hallazgos[1].imagen).toBeNull();
    expect(JSON.stringify(result.body)).not.toContain('NO DEVOLVER');
  });
});
