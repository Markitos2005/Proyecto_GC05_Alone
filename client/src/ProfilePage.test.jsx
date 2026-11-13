// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ProfilePage } from './ProfilePage.jsx';

// Pruebas de la integración con la API. Ampliar al completar la pantalla (errores por campo,
// doble envío, validación en cliente...).
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const profile = {
  id: 'id-ficticio', email: 'ana@example.com', nombre: 'Ana', apellidos: 'Ficticia Uno', telefono: '612345678', rol: 'USUARIO',
};
const ok = (data) => ({ ok: true, status: 200, json: async () => data });

it('carga el perfil del usuario con la cookie de sesión', async () => {
  const fetch = vi.fn().mockResolvedValue(ok(profile));
  vi.stubGlobal('fetch', fetch);
  render(<ProfilePage />);
  expect(await screen.findByLabelText('Nombre')).toHaveValue('Ana');
  expect(screen.getByLabelText('Apellidos')).toHaveValue('Ficticia Uno');
  expect(screen.getByLabelText('Teléfono')).toHaveValue('612345678');
  expect(screen.getByText(/ana@example.com/)).toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith('/api/profile/me', { method: 'GET', credentials: 'same-origin' });
});

it('sin sesión invita a iniciar sesión', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ message: 'detalle interno' }) }));
  render(<ProfilePage />);
  expect(await screen.findByText(/Debes iniciar sesión para ver tu perfil/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#inicio-sesion');
  expect(screen.queryByText(/detalle interno/)).not.toBeInTheDocument();
});

it('guarda los cambios y envía null al vaciar el teléfono', async () => {
  const updated = { ...profile, nombre: 'Ana María', telefono: null };
  const fetch = vi.fn().mockResolvedValueOnce(ok(profile)).mockResolvedValueOnce(ok({ message: 'ok', profile: updated }));
  vi.stubGlobal('fetch', fetch);
  render(<ProfilePage />);
  const user = userEvent.setup();
  const nombre = await screen.findByLabelText('Nombre');
  await user.clear(nombre);
  await user.type(nombre, 'Ana María');
  await user.clear(screen.getByLabelText('Teléfono'));
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('Perfil actualizado correctamente.')).toBeInTheDocument();
  expect(fetch).toHaveBeenLastCalledWith('/api/profile/me', {
    method: 'PATCH', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre: 'Ana María', apellidos: 'Ficticia Uno', telefono: null }),
  });
});

it('muestra el mensaje del servidor si los datos no son válidos', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(ok(profile)).mockResolvedValueOnce({
    ok: false, status: 400,
    json: async () => ({ message: 'Los datos del perfil no son válidos.', errors: { telefono: 'Introduce 9 cifras, con el prefijo +34 opcional.' } }),
  });
  vi.stubGlobal('fetch', fetch);
  render(<ProfilePage />);
  const user = userEvent.setup();
  await screen.findByLabelText('Nombre');
  await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
  expect(await screen.findByText('Los datos del perfil no son válidos.')).toBeInTheDocument();
});
