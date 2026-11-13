// @vitest-environment jsdom
import React from 'react';
import { afterEach, it, expect, vi } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { RegistrationForm } from './RegistrationForm.jsx';

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('muestra y oculta la contraseña sin cambiarla ni enviar el formulario', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  render(<RegistrationForm />);
  const user = await fill();
  const password = screen.getByLabelText('Contraseña');
  expect(password).toHaveAttribute('type', 'password');
  await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
  expect(password).toHaveAttribute('type', 'text');
  expect(password).toHaveValue('Prueba1234');
  expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute('aria-pressed', 'true');
  await user.keyboard('{Enter}');
  expect(password).toHaveAttribute('type', 'password');
  expect(password).toHaveValue('Prueba1234');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('no envía campos vacíos ni un correo inválido', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  render(<RegistrationForm />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ }));
  expect(fetchMock).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText('Correo electrónico'), 'sin-correo');
  await user.type(screen.getByLabelText('Contraseña'), 'Prueba1234');
  await user.click(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ }));
  expect(fetchMock).not.toHaveBeenCalled();
});
async function fill() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nombre'), 'Persona');
  await user.type(screen.getByLabelText('Apellidos'), 'Ficticia Ejemplo');
  await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'Prueba1234');
  return user;
}

it('envía el formulario, bloquea duplicados y limpia credenciales tras éxito', async () => {
  let resolve;
  const fetchMock = vi.fn(() => new Promise(r => { resolve = r; }));
  vi.stubGlobal('fetch', fetchMock);
  render(<RegistrationForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ })).toBeDisabled();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
    nombre: 'Persona', apellidos: 'Ficticia Ejemplo', email: 'test@example.com', password: 'Prueba1234',
  });
  resolve({ ok: true, json: async () => ({}) });
  expect(await screen.findByText(/Cuenta creada correctamente/)).toBeInTheDocument();
  expect(screen.getByLabelText('Contraseña')).toHaveValue('');
  expect(screen.getByLabelText('Correo electrónico')).toHaveValue('');
  expect(screen.getByLabelText('Nombre')).toHaveValue('');
  expect(screen.getByLabelText('Apellidos')).toHaveValue('');
});

it('no envía el formulario sin nombre ni apellidos', async () => {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  render(<RegistrationForm />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'Prueba1234');
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Nombre')).toBeRequired();
  expect(screen.getByLabelText('Apellidos')).toBeRequired();
});

it('muestra errores del servidor vinculados a sus campos', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: 'Revisa los datos.', errors: { email: 'Correo rechazado.', apellidos: 'Apellidos rechazados.' } }) }));
  render(<RegistrationForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ }));
  expect(await screen.findByText('Correo rechazado.')).toBeInTheDocument();
  expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByLabelText('Apellidos')).toHaveAccessibleDescription('Apellidos rechazados.');
  expect(screen.getByLabelText('Contraseña')).toHaveValue('');
});

it.each([409, 429, 500])('muestra el mensaje HTTP %s y permite reintentar', async status => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status, json: async () => ({ message: 'Mensaje comprensible del servidor.' }) }));
  render(<RegistrationForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ }));
  expect(await screen.findByText('Mensaje comprensible del servidor.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ })).toBeEnabled();
});

it('explica el fallo de red y recupera el formulario', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));
  render(<RegistrationForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ }));
  expect(await screen.findByText(/No se pudo conectar/)).toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('button', { name: /Crear cuenta|Creando cuenta/ })).toBeEnabled());
});
