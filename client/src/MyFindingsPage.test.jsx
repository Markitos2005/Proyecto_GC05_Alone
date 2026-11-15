// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MyFindingsPage } from './MyFindingsPage.jsx';

// SCRUM-113 / US-010. Solo datos ficticios.
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const ID = '44444444-4444-4444-8444-444444444444';
const IMG = '55555555-5555-4555-8555-555555555555';
const FACULTAD = '22222222-2222-4222-8222-222222222222';
const OTRA_FACULTAD = '66666666-6666-4666-8666-666666666666';
const CATEGORIA = '11111111-1111-4111-8111-111111111111';
const ok = (data) => ({ ok: true, status: 200, json: async () => data });
const fail = (status, data = {}) => ({ ok: false, status, json: async () => data });

const item = (estado = 'Activo') => ({ id: ID, descripcion: 'Mochila azul ficticia', fechaHallazgo: '2026-01-15', estado,
  categoria: 'Mochilas y bolsos', facultad: 'Facultad Ficticia', publicadoEn: '2026-11-14T10:00:00.000Z', imagen: `/api/hallazgos/${ID}/imagenes/${IMG}` });
const detail = (estado = 'Activo') => ({ hallazgo: { id: ID, autorId: 'yo', facultadId: FACULTAD, categoriaId: CATEGORIA,
  descripcion: 'Mochila azul ficticia', fechaHallazgo: '2026-01-15', latitud: 39.4789, longitud: -6.3424, puntoEntrega: 'Conserjería ficticia',
  estado, rasgosPrivados: 'Llavero ficticio dentro', imagenes: [{ id: IMG, posicion: 1, mime: 'image/png' }] } });
const OPTIONS = { facultades: [{ id: FACULTAD, nombre: 'Facultad Ficticia' }, { id: OTRA_FACULTAD, nombre: 'Otra Facultad' }],
  categorias: [{ id: CATEGORIA, nombre: 'Mochilas y bolsos' }] };

/** Servidor simulado: estado en memoria y respuestas configurables para PATCH. */
function stubServer({ estado = 'Activo', items, patch } = {}) {
  const server = { estado, historial: [] };
  const fetch = vi.fn(async (url, options = {}) => {
    const method = options.method ?? 'GET';
    if (url === '/api/hallazgos/mios') return ok({ hallazgos: items ?? [item(server.estado)] });
    if (url === '/api/hallazgos/opciones') return ok(OPTIONS);
    if (url === `/api/hallazgos/${ID}/historial`) return ok({ historial: server.historial });
    if (method === 'PATCH') {
      if (patch) return patch(url, JSON.parse(options.body), server);
      if (url.endsWith('/estado')) {
        const body = JSON.parse(options.body);
        server.historial.push({ id: 'h1', estadoAnterior: server.estado, estadoNuevo: body.estado, motivo: body.motivo ?? null, fecha: '2026-11-14T11:00:00.000Z' });
        server.estado = body.estado;
      }
      return ok({ message: 'ok', hallazgo: { id: ID, estado: server.estado } });
    }
    if (url === `/api/hallazgos/${ID}`) return ok(detail(server.estado));
    return fail(404);
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

const patches = (fetch) => fetch.mock.calls.filter(([, options]) => options?.method === 'PATCH');

async function openDetail() {
  const user = userEvent.setup();
  render(<MyFindingsPage />);
  await user.click(await screen.findByRole('button', { name: 'Ver y gestionar: Mochila azul ficticia' }));
  await screen.findByRole('heading', { level: 2, name: 'Mochila azul ficticia' });
  return user;
}

it('lista los hallazgos propios con su estado, datos y miniatura', async () => {
  stubServer({ items: [item('Activo'), { ...item('Retirado'), id: 'otro', descripcion: 'Paraguas ficticio', imagen: null }] });
  render(<MyFindingsPage />);
  const list = await screen.findByRole('list', { name: 'Tus hallazgos' });
  const rows = within(list).getAllByRole('listitem');
  expect(rows).toHaveLength(2);
  expect(within(rows[0]).getByText('Mochilas y bolsos · Facultad Ficticia · 15/01/2026')).toBeInTheDocument();
  expect(within(rows[0]).getByText('Activo')).toBeInTheDocument();
  expect(rows[0].querySelector('img')).toHaveAttribute('src', `/api/hallazgos/${ID}/imagenes/${IMG}`);
  expect(within(rows[1]).getByText('Retirado')).toBeInTheDocument();
});

it('sin hallazgos invita a publicar uno', async () => {
  stubServer({ items: [] });
  render(<MyFindingsPage />);
  expect(await screen.findByText(/Todavía no has publicado ningún hallazgo/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Publicar un hallazgo' })).toHaveAttribute('href', '#publicar-hallazgo');
});

it('sin sesión enlaza al inicio de sesión', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(401)));
  render(<MyFindingsPage />);
  expect(await screen.findByText(/Debes iniciar sesión para ver tus hallazgos/)).toBeInTheDocument();
});

it('AC-01: el detalle muestra fotos, rasgos privados e historial, y las acciones si está Activo', async () => {
  stubServer();
  await openDetail();
  expect(screen.getByText('Llavero ficticio dentro')).toBeInTheDocument();
  expect(screen.getByText('15/01/2026')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Foto 1 del hallazgo' })).toHaveAttribute('src', `/api/hallazgos/${ID}/imagenes/${IMG}`);
  expect(screen.getByText(/Sin cambios de estado/)).toBeInTheDocument();
  for (const name of ['Editar', 'Marcar como devuelto', 'Retirar']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
});

it('AC-02/AC-03: edita y envía solo los campos modificados, con coordenadas numéricas', async () => {
  const fetch = stubServer();
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await user.selectOptions(await screen.findByLabelText('Facultad donde se entregará'), OTRA_FACULTAD);
  await user.clear(screen.getByLabelText('Descripción pública'));
  await user.type(screen.getByLabelText('Descripción pública'), '  Mochila verde ficticia  ');
  await user.clear(screen.getByLabelText('Latitud'));
  await user.type(screen.getByLabelText('Latitud'), '39.5');
  await user.clear(screen.getByLabelText('Rasgos identificativos privados (opcional)'));
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));

  expect(await screen.findByText('Hallazgo actualizado correctamente.')).toBeInTheDocument();
  const [[url, options]] = patches(fetch);
  expect(url).toBe(`/api/hallazgos/${ID}`);
  expect(JSON.parse(options.body)).toEqual({ facultadId: OTRA_FACULTAD, descripcion: 'Mochila verde ficticia', latitud: 39.5, rasgosPrivados: '' });
  expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
});

it('AC-03: valida antes de enviar y no envía nada si no hay cambios', async () => {
  const fetch = stubServer();
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await user.click(await screen.findByRole('button', { name: 'Guardar cambios' }));
  expect(screen.getByText('No has cambiado ningún dato.')).toBeInTheDocument();
  await user.clear(screen.getByLabelText('Descripción pública'));
  await user.clear(screen.getByLabelText('Longitud'));
  await user.type(screen.getByLabelText('Longitud'), '181');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(screen.getByText('Describe el objeto encontrado.')).toBeInTheDocument();
  expect(screen.getByText('Introduce una longitud entre -180 y 180.')).toBeInTheDocument();
  expect(patches(fetch)).toHaveLength(0);
});

it('muestra los errores del servidor por campo', async () => {
  stubServer({ patch: () => fail(400, { message: 'Revisa los datos del hallazgo.', errors: { categoriaId: 'La opción no existe o está inactiva.' } }) });
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: 'Editar' }));
  await user.type(await screen.findByLabelText('Punto de entrega (opcional)'), ' 2');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('La opción no existe o está inactiva.')).toBeInTheDocument();
  expect(screen.getByText('Revisa los datos del hallazgo.')).toBeInTheDocument();
});

it.each([
  ['Marcar como devuelto', 'Confirmar devolución', 'Devuelto', 'Hallazgo marcado como devuelto.'],
  ['Retirar', 'Confirmar retirada', 'Retirado', 'Hallazgo retirado.'],
])('AC-04/AC-05/AC-08: «%s» pide confirmación, envía el motivo y muestra el historial', async (button, confirm, estado, done) => {
  const fetch = stubServer();
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: button }));
  expect(screen.getByText(/no se puede deshacer/)).toBeInTheDocument();
  await user.type(screen.getByLabelText('Motivo (opcional)'), 'Motivo ficticio');
  await user.click(screen.getByRole('button', { name: confirm }));

  expect(await screen.findByText(done)).toBeInTheDocument();
  const [[url, options]] = patches(fetch);
  expect(url).toBe(`/api/hallazgos/${ID}/estado`);
  expect(JSON.parse(options.body)).toEqual({ estado, motivo: 'Motivo ficticio' });
  const history = screen.getByRole('list', { name: 'Historial de estados' });
  expect(within(history).getByText(estado)).toBeInTheDocument();
  expect(screen.getByText(/Motivo: Motivo ficticio/)).toBeInTheDocument();
  // AC-06: ya no hay acciones para volver a Activo ni editar.
  expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  expect(screen.getByText(new RegExp(`Este hallazgo está ${estado.toLowerCase()}`))).toBeInTheDocument();
});

it('cancelar el cambio de estado no envía nada', async () => {
  const fetch = stubServer();
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: 'Retirar' }));
  await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  expect(patches(fetch)).toHaveLength(0);
  expect(screen.getByRole('button', { name: 'Retirar' })).toBeInTheDocument();
});

it('AC-06: un hallazgo Devuelto no ofrece editar ni cambiar de estado', async () => {
  stubServer({ estado: 'Devuelto' });
  await openDetail();
  expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Retirar' })).not.toBeInTheDocument();
  expect(screen.getByText(/ya no se puede editar ni cambiar de estado/)).toBeInTheDocument();
});

it('si otra pestaña ya cambió el estado (409), muestra el aviso y la situación real', async () => {
  stubServer({ patch: (_url, _body, server) => { server.estado = 'Retirado'; return fail(409, { message: 'Un hallazgo Devuelto o Retirado no puede cambiar de estado.' }); } });
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: 'Marcar como devuelto' }));
  await user.click(screen.getByRole('button', { name: 'Confirmar devolución' }));
  expect(await screen.findByText('Un hallazgo Devuelto o Retirado no puede cambiar de estado.')).toBeInTheDocument();
  expect(await screen.findByText(/Este hallazgo está retirado/)).toBeInTheDocument();
});

it('vuelve a la lista', async () => {
  stubServer();
  const user = await openDetail();
  await user.click(screen.getByRole('button', { name: '← Volver a mis hallazgos' }));
  expect(await screen.findByRole('list', { name: 'Tus hallazgos' })).toBeInTheDocument();
});
