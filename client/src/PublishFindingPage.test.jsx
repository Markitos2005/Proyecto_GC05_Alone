// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { PublishFindingPage } from './PublishFindingPage.jsx';

// SCRUM-103 / US-008. Solo datos ficticios.
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const FACULTAD = '22222222-2222-4222-8222-222222222222';
const CATEGORIA = '11111111-1111-4111-8111-111111111111';
const OPTIONS = {
  facultades: [{ id: FACULTAD, nombre: 'Facultad Ficticia' }],
  categorias: [{ id: CATEGORIA, nombre: 'Mochilas y bolsos' }],
};
const ok = (data, status = 200) => ({ ok: true, status, json: async () => data });
const fail = (status, data = {}) => ({ ok: false, status, json: async () => data });
const photo = (name = 'foto.png', type = 'image/png', content = 'png-ficticio') => new File([content], name, { type });

function stubFetch(...publishResponses) {
  const fetch = vi.fn(async (url) => {
    if (url === '/api/hallazgos/opciones') return ok(OPTIONS);
    return publishResponses.shift() ?? ok({ message: 'Hallazgo publicado correctamente.', hallazgo: { id: 'id', estado: 'Activo' } }, 201);
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

async function setup() {
  const user = userEvent.setup({ applyAccept: false });
  render(<PublishFindingPage />);
  await screen.findByRole('button', { name: 'Publicar hallazgo' });
  return user;
}

async function fillValid(user, files = [photo()]) {
  await user.selectOptions(screen.getByLabelText('Facultad donde se entregará'), FACULTAD);
  await user.selectOptions(screen.getByLabelText('Categoría'), CATEGORIA);
  await user.type(screen.getByLabelText('Descripción pública'), '  Mochila azul ficticia  ');
  await user.clear(screen.getByLabelText('Fecha del hallazgo'));
  await user.type(screen.getByLabelText('Fecha del hallazgo'), '2026-01-01');
  await user.type(screen.getByLabelText('Latitud'), '39.4789');
  await user.type(screen.getByLabelText('Longitud'), '-6.3424');
  await user.type(screen.getByLabelText('Punto de entrega (opcional)'), 'Conserjería ficticia');
  await user.type(screen.getByLabelText('Rasgos identificativos privados (opcional)'), 'Llavero ficticio');
  await user.upload(screen.getByLabelText('Fotos'), files);
}

const publishCalls = (fetch) => fetch.mock.calls.filter(([url]) => url === '/api/hallazgos');
const submit = (user) => user.click(screen.getByRole('button', { name: 'Publicar hallazgo' }));

it('AC-01/AC-02: carga facultades y categorías activas y explica qué es público y qué privado', async () => {
  stubFetch();
  await setup();
  expect(screen.getByRole('option', { name: 'Facultad Ficticia' })).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Mochilas y bolsos' })).toBeInTheDocument();
  expect(screen.getByText(/No se mostrarán en el listado público/)).toBeInTheDocument();
  expect(screen.getByLabelText('Fotos')).toHaveAttribute('accept', 'image/jpeg,image/png');
  expect(screen.getByLabelText('Fecha del hallazgo')).toHaveAttribute('max');
});

it('AC-03 a AC-06: envía los datos con coordenadas numéricas y las fotos, y limpia el formulario', async () => {
  const fetch = stubFetch();
  const user = await setup();
  const files = [photo('a.png'), photo('b.jpg', 'image/jpeg')];
  await fillValid(user, files);
  await submit(user);

  expect(await screen.findByText('Hallazgo publicado correctamente.')).toBeInTheDocument();
  const [[url, options]] = publishCalls(fetch);
  expect(url).toBe('/api/hallazgos');
  expect(options.method).toBe('POST');
  expect(JSON.parse(options.body.get('datos'))).toEqual({
    facultadId: FACULTAD, categoriaId: CATEGORIA, descripcion: 'Mochila azul ficticia', fechaHallazgo: '2026-01-01',
    latitud: 39.4789, longitud: -6.3424, puntoEntrega: 'Conserjería ficticia', rasgosPrivados: 'Llavero ficticio',
  });
  expect(options.body.getAll('imagenes')).toEqual(files);
  expect(screen.getByLabelText('Descripción pública')).toHaveValue('');
  expect(screen.getByLabelText('Rasgos identificativos privados (opcional)')).toHaveValue('');
  expect(screen.queryByRole('list', { name: 'Fotos seleccionadas' })).not.toBeInTheDocument();
});

it('AC-07: valida los campos obligatorios antes de enviar', async () => {
  const fetch = stubFetch();
  const user = await setup();
  await submit(user);
  expect(screen.getByText('Revisa los datos introducidos.')).toBeInTheDocument();
  expect(screen.getByText('Selecciona la facultad donde se entregará el objeto.')).toBeInTheDocument();
  expect(screen.getByText('Selecciona una categoría.')).toBeInTheDocument();
  expect(screen.getByText('Describe el objeto encontrado.')).toBeInTheDocument();
  expect(screen.getByText('Introduce una latitud entre -90 y 90.')).toBeInTheDocument();
  expect(screen.getByText('Introduce una longitud entre -180 y 180.')).toBeInTheDocument();
  expect(screen.getByText('Adjunta entre 1 y 5 fotos.')).toBeInTheDocument();
  expect(screen.getByLabelText('Descripción pública')).toHaveAttribute('aria-invalid', 'true');
  expect(publishCalls(fetch)).toHaveLength(0);
});

it.each([
  ['latitud fuera de rango', { Latitud: '91' }, 'Introduce una latitud entre -90 y 90.'],
  ['longitud fuera de rango', { Longitud: '-181' }, 'Introduce una longitud entre -180 y 180.'],
  ['fecha futura', { 'Fecha del hallazgo': '2999-01-01' }, 'La fecha no puede ser futura.'],
])('AC-07: rechaza %s', async (_, values, expected) => {
  const fetch = stubFetch();
  const user = await setup();
  await fillValid(user);
  for (const [label, value] of Object.entries(values)) {
    await user.clear(screen.getByLabelText(label));
    await user.type(screen.getByLabelText(label), value);
  }
  await submit(user);
  expect(screen.getByText(expected)).toBeInTheDocument();
  expect(publishCalls(fetch)).toHaveLength(0);
});

it.each([
  ['más de 5 fotos', Array.from({ length: 6 }, (_, i) => photo(`f${i}.png`)), 'Adjunta entre 1 y 5 fotos.'],
  ['un formato no permitido', [photo('animada.gif', 'image/gif')], 'Solo se admiten fotos JPG o PNG.'],
  ['una foto de más de 5 MiB', [photo('grande.png', 'image/png', new Uint8Array(5 * 1024 * 1024 + 1))], 'Cada foto debe ocupar como máximo 5 MiB.'],
])('AC-04: rechaza %s sin enviar nada', async (_, files, expected) => {
  const fetch = stubFetch();
  const user = await setup();
  await fillValid(user, files);
  await submit(user);
  expect(screen.getByText(expected)).toBeInTheDocument();
  expect(publishCalls(fetch)).toHaveLength(0);
});

it('AC-08: muestra los errores del servidor por campo y conserva los datos', async () => {
  stubFetch(fail(400, { message: 'Revisa los datos del hallazgo.', errors: { categoriaId: 'La categoría no existe o está inactiva.' } }));
  const user = await setup();
  await fillValid(user);
  await submit(user);
  expect(await screen.findByText('La categoría no existe o está inactiva.')).toBeInTheDocument();
  expect(screen.getByText('Revisa los datos y las imágenes.')).toBeInTheDocument();
  expect(screen.getByLabelText('Descripción pública')).toHaveValue('  Mochila azul ficticia  ');
});

it('si la sesión caduca al publicar, ofrece volver a iniciar sesión', async () => {
  stubFetch(fail(401));
  const user = await setup();
  await fillValid(user);
  await submit(user);
  expect(await screen.findByText(/Tu sesión ha caducado/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#inicio-sesion');
});

it('evita los envíos duplicados mientras publica', async () => {
  let resolve;
  const fetch = vi.fn(async (url) => (url === '/api/hallazgos/opciones'
    ? ok(OPTIONS)
    : new Promise(done => { resolve = done; })));
  vi.stubGlobal('fetch', fetch);
  const user = await setup();
  await fillValid(user);
  await submit(user);
  expect(screen.getByRole('button', { name: 'Publicando…' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Publicando…' }));
  expect(publishCalls(fetch)).toHaveLength(1);
  resolve(ok({ message: 'Hallazgo publicado correctamente.' }, 201));
  expect(await screen.findByText('Hallazgo publicado correctamente.')).toBeInTheDocument();
});

it('AC-03: rellena las coordenadas con la ubicación del dispositivo', async () => {
  stubFetch();
  vi.stubGlobal('navigator', { ...navigator, geolocation: {
    getCurrentPosition: (success) => success({ coords: { latitude: 39.47891234, longitude: -6.34241234 } }),
  } });
  const user = await setup();
  await user.click(screen.getByRole('button', { name: 'Usar mi ubicación actual' }));
  expect(screen.getByLabelText('Latitud')).toHaveValue(39.478912);
  expect(screen.getByLabelText('Longitud')).toHaveValue(-6.342412);
});

it('sin sesión no muestra el formulario y enlaza al inicio de sesión', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(401)));
  render(<PublishFindingPage />);
  expect(await screen.findByText(/Debes iniciar sesión para publicar/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Publicar hallazgo' })).not.toBeInTheDocument();
});

it('sin facultades o categorías configuradas no ofrece el formulario', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ facultades: [], categorias: OPTIONS.categorias })));
  render(<PublishFindingPage />);
  expect(await screen.findByText(/Todavía no hay facultades o categorías disponibles/)).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Publicar hallazgo' })).not.toBeInTheDocument());
});
