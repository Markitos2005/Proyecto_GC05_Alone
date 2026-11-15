// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { getAvisoOptions, publishAviso } from './avisos.js';

afterEach(() => vi.unstubAllGlobals());
it('Luis puede consultar los catálogos con la sesión existente', async () => {
  const data = { categorias: [], facultades: [], centros: [] };
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => data });
  vi.stubGlobal('fetch', fetch);
  expect(await getAvisoOptions()).toEqual(data);
  expect(fetch).toHaveBeenCalledWith('/api/avisos/opciones', { credentials: 'same-origin' });
});
it('publica el JSON del formulario con su cookie, sin cambiar los campos', async () => {
  const datos = { categoriaId: 'id', descripcion: 'Objeto ficticio', fechaPerdida: '2026-01-01' };
  const saved = { aviso: { id: 'nuevo', estado: 'Activo' } };
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => saved });
  vi.stubGlobal('fetch', fetch);
  expect(await publishAviso(datos)).toEqual(saved);
  expect(fetch).toHaveBeenCalledWith('/api/avisos', { method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) });
});
it('entrega los errores de validación para mostrarlos junto a cada campo', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400,
    json: async () => ({ errors: { descripcion: 'Obligatoria' } }) }));
  await expect(publishAviso({})).rejects.toMatchObject({ status: 400, errors: { descripcion: 'Obligatoria' } });
});
it.each([401, 403, 413, 415, 429, 500, 503])('controla HTTP %s sin mostrar errores internos', async status => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status,
    json: async () => ({ message: 'SQL secreto', errors: { privado: 'secreto' } }) }));
  await expect(publishAviso({})).rejects.toMatchObject({ status, errors: {} });
  await expect(publishAviso({})).rejects.not.toThrow('SQL secreto');
});
it('un fallo de red no repite un POST automáticamente', async () => {
  const fetch = vi.fn().mockRejectedValue(new Error('sin red'));
  vi.stubGlobal('fetch', fetch);
  await expect(publishAviso({})).rejects.toMatchObject({ status: 0 });
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('detecta respuestas que no son JSON', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error(); } }));
  await expect(getAvisoOptions()).rejects.toThrow('La respuesta del servidor no es válida.');
});
