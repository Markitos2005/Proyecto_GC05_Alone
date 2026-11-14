// @vitest-environment jsdom
import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { PasswordForm } from './PasswordForm.jsx';
import { ProfilePage } from './ProfilePage.jsx';

// SCRUM-97 / US-006. Solo contraseñas ficticias.
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const actual = 'Prueba1234';
const nueva = 'Distinta5678';
const ok = (data) => ({ ok: true, status: 200, json: async () => data });
const fail = (status, data = {}) => ({ ok: false, status, json: async () => data });

async function openForm() {
  const user = userEvent.setup();
  render(<PasswordForm />);
  await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  return user;
}

async function fill(user, values) {
  for (const [label, value] of Object.entries(values)) {
    if (value) await user.type(screen.getByLabelText(label), value);
  }
}

const valid = { 'Contraseña actual': actual, 'Nueva contraseña': nueva, 'Repite la nueva contraseña': nueva };
const submit = (user) => user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));

it('se inicia desde el perfil con un botón y pide los tres campos (AC-01, AC-02)', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({
    id: 'id-ficticio', email: 'ana@example.com', nombre: 'Ana', apellidos: 'Ficticia', telefono: null, rol: 'USUARIO',
  })));
  render(<ProfilePage />);
  const user = userEvent.setup();
  expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument();
  await user.click(await screen.findByRole('button', { name: 'Cambiar contraseña' }));
  expect(screen.getByLabelText('Contraseña actual')).toHaveAttribute('type', 'password');
  expect(screen.getByLabelText('Contraseña actual')).toHaveAttribute('autocomplete', 'current-password');
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('autocomplete', 'new-password');
  expect(screen.getByLabelText('Repite la nueva contraseña')).toHaveAttribute('autocomplete', 'new-password');
});

it('no se ofrece si la cuenta no tiene contraseña local (AC-08)', () => {
  render(<PasswordForm localPassword={false} />);
  expect(screen.queryByRole('button', { name: 'Cambiar contraseña' })).not.toBeInTheDocument();
});

it.each([
  ['las nuevas no coinciden', { ...valid, 'Repite la nueva contraseña': 'Otra9999x' }, 'Las contraseñas nuevas no coinciden.'],
  ['la nueva es débil', { ...valid, 'Nueva contraseña': 'corta1', 'Repite la nueva contraseña': 'corta1' }, 'Usa al menos 8 caracteres, una letra y un número.'],
  ['la nueva es igual a la actual', { ...valid, 'Nueva contraseña': actual, 'Repite la nueva contraseña': actual }, 'La nueva contraseña debe ser distinta de la actual.'],
  ['falta la contraseña actual', { ...valid, 'Contraseña actual': '' }, 'Introduce tu contraseña actual.'],
])('valida en el cliente sin llamar al servidor si %s (AC-03, AC-04)', async (_caso, values, error) => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const user = await openForm();
  await fill(user, values);
  await submit(user);
  expect(await screen.findByText(error)).toBeInTheDocument();
  expect(screen.getByText('Revisa los datos introducidos.')).toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
});

it('envía el cambio con la cookie, informa del resultado y borra los campos (AC-10)', async () => {
  const fetch = vi.fn().mockResolvedValue(ok({ message: 'Contraseña actualizada correctamente. Se han cerrado tus demás sesiones abiertas.' }));
  vi.stubGlobal('fetch', fetch);
  const user = await openForm();
  await fill(user, valid);
  await submit(user);
  expect(await screen.findByText('Contraseña actualizada correctamente. Se han cerrado tus demás sesiones abiertas.')).toHaveClass('success');
  expect(fetch).toHaveBeenCalledWith('/api/profile/me/password', {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actual, nueva, confirmacion: nueva }),
  });
  // El formulario se cierra y las contraseñas desaparecen de la página.
  expect(screen.queryByLabelText('Contraseña actual')).not.toBeInTheDocument();
  expect(document.body.innerHTML).not.toContain(nueva);
});

it('impide el doble envío mientras se guarda', async () => {
  let resolve;
  const fetch = vi.fn(() => new Promise(done => { resolve = done; }));
  vi.stubGlobal('fetch', fetch);
  const user = await openForm();
  await fill(user, valid);
  await submit(user);
  expect(screen.getByRole('button', { name: 'Cambiando…' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Cambiando…' }));
  expect(fetch).toHaveBeenCalledTimes(1);
  resolve(ok({ message: 'ok' }));
  await screen.findByText('ok');
});

it('muestra los errores por campo del servidor y vacía la contraseña actual', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(400, {
    message: 'Los datos del cambio de contraseña no son válidos.',
    errors: { actual: 'La contraseña actual no es correcta.' },
  })));
  const user = await openForm();
  await fill(user, valid);
  await submit(user);
  expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument();
  expect(screen.getByLabelText('Contraseña actual')).toHaveValue('');
  expect(screen.getByLabelText('Contraseña actual')).toHaveAttribute('aria-invalid', 'true');
});

it.each([
  [429, 'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.'],
  [409, 'Tu cuenta no utiliza una contraseña local.'],
  [500, 'No se ha podido cambiar la contraseña.'],
])('con %s muestra un mensaje propio sin detalles internos', async (status, text) => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(status, { message: 'detalle interno' })));
  const user = await openForm();
  await fill(user, valid);
  await submit(user);
  expect(await screen.findByText(text)).toBeInTheDocument();
  expect(screen.queryByText(/detalle interno/)).not.toBeInTheDocument();
});

it('si la sesión ha caducado invita a iniciar sesión', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fail(401)));
  const user = await openForm();
  await fill(user, valid);
  await submit(user);
  expect(await screen.findByText(/Tu sesión ha caducado/)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Iniciar sesión' })).toHaveAttribute('href', '#inicio-sesion');
});

it('permite mostrar las contraseñas y cancelar borrando lo escrito', async () => {
  const user = await openForm();
  await fill(user, valid);
  await user.click(screen.getByLabelText('Mostrar las contraseñas'));
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('type', 'text');
  await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  await user.click(screen.getByRole('button', { name: 'Cambiar contraseña' }));
  expect(screen.getByLabelText('Nueva contraseña')).toHaveValue('');
  expect(screen.getByLabelText('Nueva contraseña')).toHaveAttribute('type', 'password');
});
