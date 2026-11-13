import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';

// Doble del repositorio, no de la seguridad: se calcula y verifica Argon2 real.
function fixture() {
  const records = new Map();
  const users = {
    async emailExists(email) { return records.has(email); },
    async create(data) {
      if (records.has(data.email)) throw { code: '23505', constraint: 'usuarios_email_key' };
      const row = { ...data, rol: 'USUARIO', activo: true };
      records.set(data.email, row);
      return row;
    },
  };
  return { records, users, app: createApp({ users, registrationLimit: 100 }) };
}
const valid = { nombre: 'Persona', apellidos: 'Ficticia Ejemplo', email: 'persona@example.com', password: 'Prueba1234' };

describe('US-001: contrato de registro', () => {
  it('201, correo normalizado, UUID, rol fijo, cuenta activa y hash verificable', async () => {
    const { app, records } = fixture();
    const result = await request(app).post('/api/auth/register').send({ ...valid, nombre: '  Persona ', email: ' Persona@EXAMPLE.com ', rol: 'ADMINISTRADOR', activo: false });
    expect(result.status).toBe(201);
    expect(result.body.user).toEqual({ id: expect.stringMatching(/^[0-9a-f-]{36}$/), email: valid.email, rol: 'USUARIO' });
    const row = records.get(valid.email);
    expect(row.activo).toBe(true);
    expect(row.nombre).toBe('Persona');
    expect(row.apellidos).toBe('Ficticia Ejemplo');
    expect(row.passwordHash).toMatch(/^\$argon2id\$/);
    expect(await argon2.verify(row.passwordHash, valid.password)).toBe(true);
    expect(await argon2.verify(row.passwordHash, 'Otra1234')).toBe(false);
    expect(JSON.stringify(result.body)).not.toContain(row.passwordHash);
    expect(JSON.stringify(result.body)).not.toContain(valid.password);
    expect(result.headers['cache-control']).toBe('no-store');
  });

  it.each([
    {}, { email: valid.email }, { password: valid.password },
    { ...valid, email: '' }, { ...valid, email: 'incorrecto' },
    { ...valid, email: 'a@' + 'a'.repeat(250) + '.com' },
    { ...valid, email: ['a@example.com'] }, { ...valid, password: 12345678 },
    { ...valid, password: 'A123456' }, { ...valid, password: 'abcdefgh' },
    { ...valid, password: '12345678' }, { ...valid, password: 'A1' + 'a'.repeat(127) },
    { email: valid.email, password: valid.password }, { ...valid, nombre: '   ' },
    { ...valid, apellidos: '' }, { ...valid, nombre: 42 },
    { ...valid, nombre: 'a'.repeat(101) }, { ...valid, apellidos: 'a'.repeat(151) },
  ])('400 sin persistencia ante entrada inválida: %j', async body => {
    const { app, records } = fixture();
    const result = await request(app).post('/api/auth/register').send(body);
    expect(result.status).toBe(400);
    expect(records.size).toBe(0);
    expect(result.body.errors).toBeDefined();
  });

  it('acepta el mínimo de ocho caracteres y dominios ajenos a UEx', async () => {
    const { app } = fixture();
    expect((await request(app).post('/api/auth/register').send({ ...valid, email: 'test@example.org', password: 'Abcdefg1' })).status).toBe(201);
  });

  it('asocia cada error de nombre y apellidos a su campo', async () => {
    const { app } = fixture();
    const result = await request(app).post('/api/auth/register').send({ email: valid.email, password: valid.password });
    expect(result.body.errors).toMatchObject({
      nombre: 'El nombre es obligatorio.',
      apellidos: 'Los apellidos son obligatorios.',
    });
  });

  it('409 para duplicado normalizado, incluso cuenta desactivada', async () => {
    const { app, records } = fixture();
    await request(app).post('/api/auth/register').send(valid);
    records.get(valid.email).activo = false;
    const result = await request(app).post('/api/auth/register').send({ ...valid, email: ' PERSONA@EXAMPLE.COM ' });
    expect(result.status).toBe(409);
    expect(result.body).toEqual({ message: 'No se puede registrar ese correo.' });
    expect(records.size).toBe(1);
  });

  it('dos peticiones simultáneas crean una sola cuenta', async () => {
    const { app, records } = fixture();
    const results = await Promise.all([request(app).post('/api/auth/register').send(valid), request(app).post('/api/auth/register').send(valid)]);
    expect(results.map(r => r.status).sort()).toEqual([201, 409]);
    expect(records.size).toBe(1);
  });

  it('500 genérico sin filtrar errores de persistencia ni secretos en logs', async () => {
    const logError = vi.fn();
    const app = createApp({ users: { emailExists: async () => { throw new Error('clave-secreta-de-db'); } }, logError });
    const result = await request(app).post('/api/auth/register').send(valid);
    expect(result.status).toBe(500);
    expect(result.body).toEqual({ message: 'No se ha podido completar el registro.' });
    expect(logError).toHaveBeenCalledWith();
  });

  it('rechaza JSON roto, cuerpos excesivos y formatos distintos de JSON', async () => {
    const { app } = fixture();
    expect((await request(app).post('/api/auth/register').type('json').send('{')).status).toBe(400);
    expect((await request(app).post('/api/auth/register').send({ padding: 'a'.repeat(17000) })).status).toBe(413);
    expect((await request(app).post('/api/auth/register').type('form').send(valid)).status).toBe(415);
  });

  it('limita intentos sin revelar disponibilidad de cuentas', async () => {
    const { users } = fixture();
    const app = createApp({ users, registrationLimit: 1 });
    await request(app).post('/api/auth/register').send({});
    const result = await request(app).post('/api/auth/register').send(valid);
    expect(result.status).toBe(429);
    expect(result.headers['retry-after']).toBeDefined();
  });
});
