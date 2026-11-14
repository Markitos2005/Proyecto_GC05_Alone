import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';
import { createRecoveryService, RECOVERY_CONFIRMATION } from '../src/services/recovery.js';

function fixture({ eligible = true, recoveryLimit = 100 } = {}) {
  const client = { query: vi.fn(async () => ({ rowCount: 1 })) };
  const tokens = {
    isValid: vi.fn(async () => true),
    issue: vi.fn(async () => eligible ? { email: 'persona@example.com', token: 'a'.repeat(64) } : null),
    consume: vi.fn(async (_token, apply) => { await apply(client, 'usuario-ficticio'); return true; }),
  };
  const sendRecovery = vi.fn(async () => {});
  const logError = vi.fn();
  const recovery = createRecoveryService({ tokens, sendRecovery, logError });
  const app = createApp({ users: {}, recovery, recoveryLimit, logError });
  return { app, tokens, client, sendRecovery, logError };
}

describe('SCRUM-43: API de recuperación', () => {
  it('comprueba un enlace sin consumirlo ni revelar datos de cuenta', async () => {
    const { app, tokens } = fixture();
    const response = await request(app).post('/api/auth/validate-reset-token').send({ token: 'a'.repeat(64) });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Enlace válido.' });
    expect(tokens.consume).not.toHaveBeenCalled();
  });
  it('comprobación rechaza enlaces no vigentes', async () => {
    const { app, tokens } = fixture();
    tokens.isValid.mockResolvedValueOnce(false);
    const response = await request(app).post('/api/auth/validate-reset-token').send({ token: 'a'.repeat(64) });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Enlace expirado o no válido');
  });
  it('normaliza correo y responde sin exponer token ni cuenta', async () => {
    const { app, tokens, sendRecovery } = fixture();
    const response = await request(app).post('/api/auth/forgot-password').send({ email: ' Persona@EXAMPLE.com ' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: RECOVERY_CONFIRMATION });
    expect(tokens.issue).toHaveBeenCalledWith('persona@example.com');
    expect(sendRecovery).toHaveBeenCalledWith({ email: 'persona@example.com', token: 'a'.repeat(64) });
    expect(response.headers['cache-control']).toBe('no-store');
  });
  it('misma confirmación sin correo enviado para cuentas no elegibles o límite por correo', async () => {
    const { app, sendRecovery } = fixture({ eligible: false });
    const response = await request(app).post('/api/auth/forgot-password').send({ email: 'nadie@example.com' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: RECOVERY_CONFIRMATION });
    expect(sendRecovery).not.toHaveBeenCalled();
  });
  it.each([{}, { email: 12 }, { email: 'incorrecto' }, { email: 'a'.repeat(255) + '@example.com' }])('rechaza correo inválido', async (body) => {
    const { app, tokens } = fixture();
    expect((await request(app).post('/api/auth/forgot-password').send(body)).status).toBe(400);
    expect(tokens.issue).not.toHaveBeenCalled();
  });
  it('fallo SMTP no revela cuenta ni secretos mediante logs/respuesta', async () => {
    const { app, sendRecovery, logError } = fixture();
    sendRecovery.mockRejectedValueOnce(new Error('secreto-ficticio'));
    const response = await request(app).post('/api/auth/forgot-password').send({ email: 'persona@example.com' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: RECOVERY_CONFIRMATION });
    expect(logError).toHaveBeenCalledWith();
  });
  it('cambio con Argon2id y revocación de sesiones en el cliente transaccional', async () => {
    const { app, client } = fixture();
    const response = await request(app).post('/api/auth/reset-password').send({
      token: 'a'.repeat(64), password: 'Nueva1234', confirmPassword: 'Nueva1234',
    });
    expect(response.status).toBe(200);
    const [sql, [hash, id]] = client.query.mock.calls[0];
    expect(sql).toContain('UPDATE usuarios');
    expect(id).toBe('usuario-ficticio');
    expect(hash).toMatch(/^\$argon2id\$/);
    expect(await argon2.verify(hash, 'Nueva1234')).toBe(true);
    expect(client.query.mock.calls[1]).toEqual(["DELETE FROM sesiones WHERE sess->>'userId' = $1", ['usuario-ficticio']]);
    expect(JSON.stringify(response.body)).not.toContain(hash);
    expect(response.body).toEqual({ message: 'Contraseña restablecida. Inicia sesión con tu nueva contraseña.' });
  });
  it.each(['', 'corta1', 'sinNumeros', '123456789', 'a1'.repeat(65), null])('rechaza contraseña inválida sin consumir enlace', async (password) => {
    const { app, tokens } = fixture();
    expect((await request(app).post('/api/auth/reset-password').send({ token: 'a'.repeat(64), password, confirmPassword: password })).status).toBe(400);
    expect(tokens.consume).not.toHaveBeenCalled();
  });
  it('rechaza confirmación diferente sin consumir enlace', async () => {
    const { app, tokens } = fixture();
    expect((await request(app).post('/api/auth/reset-password').send({ token: 'a'.repeat(64), password: 'Nueva1234', confirmPassword: 'Otra1234' })).status).toBe(400);
    expect(tokens.consume).not.toHaveBeenCalled();
  });
  it.each([{}, { token: 'manipulado' }, { token: null }])('rechaza formato de enlace inválido', async (body) => {
    const { app, tokens } = fixture();
    expect((await request(app).post('/api/auth/reset-password').send(body)).status).toBe(400);
    expect(tokens.consume).not.toHaveBeenCalled();
  });
  it('enlace caducado, usado o desconocido devuelve un error comprensible', async () => {
    const { app, tokens } = fixture();
    tokens.consume.mockResolvedValueOnce(false);
    const response = await request(app).post('/api/auth/reset-password').send({ token: 'a'.repeat(64), password: 'Nueva1234', confirmPassword: 'Nueva1234' });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Solicita uno nuevo');
  });
  it('limita peticiones por IP adicionalmente al límite persistente por correo', async () => {
    const { app } = fixture({ recoveryLimit: 1 });
    await request(app).post('/api/auth/forgot-password').send({ email: 'persona@example.com' });
    expect((await request(app).post('/api/auth/forgot-password').send({ email: 'otra@example.com' })).status).toBe(429);
  });
  it('rechaza cuerpo sin JSON y JSON mal formado', async () => {
    const { app } = fixture();
    expect((await request(app).post('/api/auth/forgot-password').type('text').send('hola')).status).toBe(415);
    expect((await request(app).post('/api/auth/forgot-password').type('json').send('{')).status).toBe(400);
  });
  it('sin servicio configurado devuelve 503', async () => {
    const app = createApp({ users: {} });
    expect((await request(app).post('/api/auth/forgot-password').send({ email: 'persona@example.com' })).status).toBe(503);
  });
  it('error de base de datos no filtra su contenido', async () => {
    const { app, tokens, logError } = fixture();
    tokens.issue.mockRejectedValueOnce(new Error('dato-secreto'));
    const response = await request(app).post('/api/auth/forgot-password').send({ email: 'persona@example.com' });
    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain('dato-secreto');
    expect(logError).toHaveBeenCalledWith();
  });
});
