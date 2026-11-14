/** SCRUM-97 / US-006. Contrato de SCRUM-45: POST /api/profile/me/password con la cookie de sesión. */

export class PasswordApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Textos controlados por la interfaz: nunca se muestran detalles internos del servidor.
const messages = {
  401: 'Tu sesión ha caducado. Inicia sesión de nuevo para cambiar la contraseña.',
  403: 'No se ha podido verificar la petición. Recarga la página e inténtalo de nuevo.',
  409: 'Tu cuenta no utiliza una contraseña local.',
  429: 'Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.',
};

export async function changePassword({ actual, nueva, confirmacion }) {
  let response;
  try {
    response = await fetch('/api/profile/me/password', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual, nueva, confirmacion }),
    });
  } catch {
    throw new PasswordApiError(0, 'No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // 400 trae mensajes por campo; el resto usa textos propios.
    if (response.status === 400) {
      throw new PasswordApiError(400, data?.message || 'Revisa los datos introducidos.', data?.errors);
    }
    throw new PasswordApiError(response.status, messages[response.status] || 'No se ha podido cambiar la contraseña.');
  }
  return data;
}
