import { describe, it, expect, vi } from 'vitest';
import { createRecoveryTokens, recoveryDigest } from '../src/services/recoveryTokens.js';

describe('SCRUM-96: tokens internos de recuperación', () => {
  it('normaliza el correo y entrega al repositorio solo hashes del token y correo', async () => {
    const repository = { issue: vi.fn(async () => ({ email: 'persona@example.com', expiresAt: new Date() })) };
    const service = createRecoveryTokens(repository);
    const first = await service.issue(' Persona@EXAMPLE.com ');
    const second = await service.issue('persona@example.com');
    expect(first.token).toMatch(/^[a-f0-9]{64}$/);
    expect(second.token).not.toBe(first.token);
    expect(repository.issue.mock.calls[0][0]).toEqual({
      email: 'persona@example.com', emailHash: recoveryDigest('persona@example.com'), tokenHash: recoveryDigest(first.token),
    });
  });

  it('no genera resultados públicos diferentes para cuentas no elegibles o limitadas', async () => {
    const service = createRecoveryTokens({ issue: async () => null });
    expect(await service.issue('nadie@example.com')).toBeNull();
  });

  it.each([null, '', 'sin-correo', 'a'.repeat(255) + '@example.com'])('rechaza correo inválido: %s', async (email) => {
    const issue = vi.fn();
    await expect(createRecoveryTokens({ issue }).issue(email)).rejects.toThrow(TypeError);
    expect(issue).not.toHaveBeenCalled();
  });

  it.each([null, '', 'alterado', 'A'.repeat(64), '0'.repeat(65)])('rechaza un token mal formado: %s', async (token) => {
    const consume = vi.fn();
    expect(await createRecoveryTokens({ consume }).consume(token, async () => {})).toBe(false);
    expect(consume).not.toHaveBeenCalled();
  });

  it('pasa únicamente el hash y la operación atómica al repositorio', async () => {
    const consume = vi.fn(async () => true);
    const apply = async () => {};
    const token = 'a'.repeat(64);
    expect(await createRecoveryTokens({ consume }).consume(token, apply)).toBe(true);
    expect(consume).toHaveBeenCalledWith(recoveryDigest(token), apply);
  });

  it('no permite consumir un enlace sin operación de restablecimiento', async () => {
    await expect(createRecoveryTokens({}).consume('a'.repeat(64))).rejects.toThrow(TypeError);
  });
});
