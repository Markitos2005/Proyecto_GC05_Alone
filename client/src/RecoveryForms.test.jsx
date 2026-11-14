// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { ForgotPasswordForm, ResetPasswordForm } from './RecoveryForms.jsx';
import { App } from './App.jsx';
import * as recoveryApi from './api/recovery.js';

const token = 'a'.repeat(64);
const ok = () => ({ ok: true, json: async () => ({ message: 'Confirmación del servidor' }) });

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(recoveryApi, 'validateRecoveryToken').mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); window.history.replaceState(null, '', '/'); });

async function fillReset(password = 'Nueva1234', confirmation = password) {
  await screen.findByLabelText('Nueva contraseña');
  const user = userEvent.setup();
  if (password) await user.type(screen.getByLabelText('Nueva contraseña'), password);
  if (confirmation) await user.type(screen.getByLabelText('Repite la nueva contraseña'), confirmation);
  return user;
}

it('navega desde login a recuperación y permite volver', async () => {
  window.location.hash = '#inicio-sesion';
  render(<App />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('link', { name: 'He olvidado mi contraseña' }));
  expect(await screen.findByRole('heading', { name: 'Recupera tu contraseña' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Volver a iniciar sesión' }));
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
});

it('no envía correo vacío ni mal formado', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  await user.type(screen.getByLabelText('Correo electrónico'), 'incorrecto');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(fetch).not.toHaveBeenCalled();
});

it('envía el correo normalizado a la API real y muestra confirmación genérica', async () => {
  const fetch = vi.fn().mockResolvedValue(ok()); vi.stubGlobal('fetch', fetch);
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'Persona@EXAMPLE.com');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(await screen.findByRole('status')).toHaveTextContent('Si el correo pertenece a una cuenta activa');
  expect(fetch).toHaveBeenCalledWith('/api/auth/forgot-password', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'persona@example.com' }),
  });
  expect(screen.queryByLabelText('Correo electrónico')).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'solicítalo de nuevo' }));
  expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
});

it('bloquea solicitudes duplicadas durante el envío', async () => {
  let resolve;
  const fetch = vi.fn(() => new Promise(done => { resolve = done; })); vi.stubGlobal('fetch', fetch);
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Enviando…' }));
  expect(fetch).toHaveBeenCalledTimes(1);
  resolve(ok());
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Revisa tu buzón'));
});

it.each([
  [400, 'Introduce un correo válido.'],
  [429, 'Demasiados intentos. Inténtalo más tarde.'],
  [500, 'No se ha podido completar la operación. Inténtalo más tarde.'],
  [503, 'No se ha podido completar la operación. Inténtalo más tarde.'],
])('solicitud: maneja HTTP %s sin mostrar detalles internos', async (status, message) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ message: 'Cuenta privada, token secreto' }) }));
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(message);
  expect(screen.queryByText(/token secreto/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Enviar enlace' })).toBeEnabled();
});

it('permite reintentar la solicitud tras un fallo de red', async () => {
  const fetch = vi.fn().mockRejectedValueOnce(new Error('red')).mockResolvedValueOnce(ok()); vi.stubGlobal('fetch', fetch);
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Revisa tu buzón'));
});

it.each([{}, null, { message: '' }])('no presenta éxito ante una respuesta incompleta', async (data) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => data }));
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('La respuesta del servidor no es válida');
});

it('controla una respuesta que no es JSON', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => { throw new Error(); } }));
  render(<ForgotPasswordForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'persona@example.com');
  await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('La respuesta del servidor no es válida');
});

it.each(['#restablecer-contrasena', '#restablecer-contrasena?token=alterado', `#restablecer-contrasena?token=${token}&token=${token}`])('rechaza enlace incompleto, manipulado o ambiguo: %s', (hash) => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  window.location.hash = hash;
  render(<App />);
  expect(screen.getByRole('alert')).toHaveTextContent('Enlace expirado o no válido');
  expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Solicitar un nuevo enlace' })).toHaveAttribute('href', '#recuperar-contrasena');
  expect(fetch).not.toHaveBeenCalled();
});

it.each(['corta1', 'sinnumeros', '123456789'])('valida fortaleza sin enviar contraseña inválida: %s', async (password) => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  const user = await fillReset(password);
  await user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Usa entre 8 y 128 caracteres');
  expect(fetch).not.toHaveBeenCalled();
});

it('no envía contraseñas distintas ni campos vacíos', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  await screen.findByLabelText('Nueva contraseña');
  await userEvent.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  expect(fetch).not.toHaveBeenCalled();
  const user = await fillReset('Nueva1234', 'Otra1234');
  await user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  expect(screen.getByRole('alert')).toHaveTextContent('Las contraseñas no coinciden');
  expect(fetch).not.toHaveBeenCalled();
});

it('muestra y oculta cada contraseña sin enviar nada', async () => {
  const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  const user = await fillReset();
  await user.click(screen.getByRole('button', { name: 'Mostrar nueva contraseña' }));
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('type', 'text');
  expect(screen.getByLabelText('Repite la nueva contraseña')).toHaveAttribute('type', 'password');
  await user.click(screen.getByRole('button', { name: 'Ocultar nueva contraseña' }));
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('type', 'password');
  expect(fetch).not.toHaveBeenCalled();
});

it('envía token y contraseñas sin recortarlas, bloquea duplicados y limpia los campos', async () => {
  let resolve;
  const fetch = vi.fn(() => new Promise(done => { resolve = done; })); vi.stubGlobal('fetch', fetch);
  const onReset = vi.fn();
  render(<ResetPasswordForm token={token} onReset={onReset} />);
  const user = await fillReset(' Nueva1234 ');
  await user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Guardando…' }));
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith('/api/auth/reset-password', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password: ' Nueva1234 ', confirmPassword: ' Nueva1234 ' }),
  });
  resolve(ok());
  await waitFor(() => expect(onReset).toHaveBeenCalledOnce());
  expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('');
  expect(screen.getByLabelText('Repite la nueva contraseña')).toHaveValue('');
});

it.each([400, 429, 500])('restablecimiento: maneja HTTP %s y permite reintentar sin conservar contraseñas', async (status) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status }));
  const onReset = vi.fn();
  render(<ResetPasswordForm token={token} onReset={onReset} />);
  const user = await fillReset();
  await user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  await waitFor(() => expect(screen.getByRole('alert')).not.toBeEmptyDOMElement());
  expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('');
  expect(screen.getByLabelText('Repite la nueva contraseña')).toHaveValue('');
  expect(onReset).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Guardar nueva contraseña' })).toBeEnabled();
});

it('restablecimiento: maneja fallo de red', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('red')));
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  const user = await fillReset();
  await user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('No se pudo conectar'));
});

it('el enlace del correo abre el formulario y un cambio correcto vuelve a login eliminando el token de la URL', async () => {
  const fetch = vi.fn().mockResolvedValue(ok()); vi.stubGlobal('fetch', fetch);
  const storage = vi.spyOn(Storage.prototype, 'setItem');
  window.location.hash = `#restablecer-contrasena?token=${token}`;
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Establece una nueva contraseña' })).toBeInTheDocument();
  const user = await fillReset();
  await user.click(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));
  expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument();
  expect(screen.getByText('Contraseña restablecida. Inicia sesión con tu nueva contraseña.')).toBeInTheDocument();
  expect(window.location.hash).toBe('#inicio-sesion');
  expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(storage).not.toHaveBeenCalled();
});

it('no muestra campos mientras la API comprueba el enlace', async () => {
  let resolve;
  recoveryApi.validateRecoveryToken.mockImplementation(() => new Promise(done => { resolve = done; }));
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  expect(screen.getByRole('status')).toHaveTextContent('Comprobando');
  expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
  resolve();
  expect(await screen.findByLabelText('Nueva contraseña')).toBeInTheDocument();
});

it.each(['sustituido', 'caducado', 'usado'])('enlace %s: muestra aviso sin formulario al abrirlo', async () => {
  const error = Object.assign(new Error('Enlace expirado o no válido.'), { invalidToken: true });
  recoveryApi.validateRecoveryToken.mockRejectedValue(error);
  window.location.hash = `#restablecer-contrasena?token=${token}`;
  render(<App />);
  expect(await screen.findByRole('heading', { name: 'Enlace expirado o no válido' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Solicitar un nuevo enlace' })).toBeInTheDocument();
});

it('un fallo de red no se confunde con un enlace inválido y permite reintentar', async () => {
  recoveryApi.validateRecoveryToken.mockRejectedValueOnce(new Error('No se pudo conectar con el servidor.')).mockResolvedValueOnce(undefined);
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo conectar');
  expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Reintentar comprobación' }));
  expect(await screen.findByLabelText('Nueva contraseña')).toBeInTheDocument();
});

it('comprueba el token con POST sin incluirlo en la URL ni consumirlo', async () => {
  recoveryApi.validateRecoveryToken.mockRestore();
  const fetch = vi.fn().mockResolvedValue(ok()); vi.stubGlobal('fetch', fetch);
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  await screen.findByLabelText('Nueva contraseña');
  expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/auth/validate-reset-token', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
  });
});

it('interpreta la respuesta 400 de la comprobación real como enlace inválido', async () => {
  recoveryApi.validateRecoveryToken.mockRestore();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }));
  render(<ResetPasswordForm token={token} onReset={vi.fn()} />);
  expect(await screen.findByRole('heading', { name: 'Enlace expirado o no válido' })).toBeInTheDocument();
  expect(screen.queryByLabelText('Nueva contraseña')).not.toBeInTheDocument();
});
