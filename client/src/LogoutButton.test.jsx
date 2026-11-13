// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { LogoutButton } from './LogoutButton.jsx';
import { App } from './App.jsx';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); window.location.hash = ''; });

it('envía la cookie sin credenciales y espera la confirmación antes de salir', async () => {
  let resolve;
  const fetch = vi.fn(() => new Promise(done => { resolve = done; }));
  vi.stubGlobal('fetch', fetch);
  const closed = vi.fn();
  render(<LogoutButton onLogout={closed} csrfToken="token-ficticio" />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(closed).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Cerrando sesión…' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Cerrando sesión…' }));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('/api/auth/logout', {
    method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': 'token-ficticio' },
  });
  resolve({ status: 200 });
  await screen.findByRole('button', { name: 'Cerrar sesión' });
  expect(closed).toHaveBeenCalledTimes(1);
});

it.each([403, 404, 500])('no declara el cierre si la API devuelve %s', async status => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status }));
  const closed = vi.fn();
  render(<LogoutButton onLogout={closed} />);
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(closed).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeEnabled();
});

it('limpia el estado local cuando la API confirma una sesión ya inválida', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401 }));
  const closed = vi.fn();
  render(<LogoutButton onLogout={closed} />);
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(closed).toHaveBeenCalledTimes(1);
});

it('conserva el estado de acceso si falla la red', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
  const closed = vi.fn();
  render(<LogoutButton onLogout={closed} />);
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido confirmar');
  expect(closed).not.toHaveBeenCalled();
});

it('la demostración vuelve a la portada sin API y una URL privada no recupera el acceso', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  render(<App />);
  const user = userEvent.setup();
  expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Ver demostración sin API' }));
  expect(screen.getByText(/Demostración visual/)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(screen.getByText(/Demostración terminada/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Crear cuenta' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Crea tu cuenta' })).not.toBeInTheDocument();
  window.location.hash = '#app';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  expect(screen.queryByRole('button', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it('conecta el login real con el inicio y el cierre real', async () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  window.location.hash = '#inicio-sesion';
  const fetch = vi.fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { id: 'id-test', email: 'test@example.com', rol: 'USUARIO' } }) })
    .mockResolvedValueOnce({ status: 200 });
  vi.stubGlobal('fetch', fetch);
  render(<App />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'Prueba1234');
  await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
  await user.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));
  expect(await screen.findByText('Sesión cerrada correctamente.')).toBeInTheDocument();
  expect(fetch.mock.calls.map(call => call[0])).toEqual(['/api/auth/login', '/api/auth/logout']);
});
