// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { getHallazgoOptions, publishHallazgo } from './hallazgos.js';

afterEach(() => vi.unstubAllGlobals());

it('envía FormData con los campos acordados y deja al navegador el Content-Type', async () => {
  const response = { message: 'Hallazgo publicado correctamente.', hallazgo: { id: 'id', estado: 'Activo' } };
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => response });
  vi.stubGlobal('fetch', fetch);
  const datos = { descripcion: 'Ficticia', latitud: 0, longitud: 0 };
  const photo = new File(['ficticia'], 'foto.png', { type: 'image/png' });
  expect(await publishHallazgo(datos, [photo])).toEqual(response);
  const [url, options] = fetch.mock.calls[0];
  expect(url).toBe('/api/hallazgos');
  expect(options.credentials).toBe('same-origin');
  expect(options.headers).toBeUndefined();
  expect(options.body.get('datos')).toBe(JSON.stringify(datos));
  expect(options.body.getAll('imagenes')).toEqual([photo]);
});
it('obtiene opciones con la cookie de sesión', async () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ categorias: [] }) });
  vi.stubGlobal('fetch', fetch);
  await getHallazgoOptions();
  expect(fetch).toHaveBeenCalledWith('/api/hallazgos/opciones', { credentials: 'same-origin' });
});
it.each([400, 401, 403, 413, 415, 429, 503, 500])('controla HTTP %s y facilita los errores de campo', async status => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ message: 'secreto interno', errors: { descripcion: 'Revisa el texto' } }) }));
  await expect(getHallazgoOptions()).rejects.toMatchObject({ status, errors: { descripcion: 'Revisa el texto' } });
  await expect(getHallazgoOptions()).rejects.not.toThrow('secreto interno');
});
it('controla un fallo de red', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('red')));
  await expect(getHallazgoOptions()).rejects.toThrow('No se pudo conectar');
});
it('controla una respuesta no JSON', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => { throw new Error(); } }));
  await expect(getHallazgoOptions()).rejects.toThrow('La respuesta del servidor no es válida');
});
