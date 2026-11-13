/** Contrato SCRUM-93: GET y PATCH /api/profile/me con la cookie de sesión (mismo origen). */

export class ProfileApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

const messages = {
  401: 'Debes iniciar sesión para ver tu perfil.',
  404: 'No se ha encontrado el perfil.',
  429: 'Demasiados intentos. Inténtalo más tarde.',
};

async function request(method, body) {
  let response;
  try {
    response = await fetch('/api/profile/me', {
      method,
      credentials: 'same-origin',
      ...(body !== undefined && {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    });
  } catch {
    throw new ProfileApiError(0, 'No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    // 400 trae mensajes por campo; el resto usa textos controlados por la interfaz.
    if (response.status === 400) {
      throw new ProfileApiError(400, data?.message || 'Los datos del perfil no son válidos.', data?.errors);
    }
    throw new ProfileApiError(response.status, messages[response.status] || 'No se ha podido completar la operación.');
  }
  return data;
}

export const getProfile = () => request('GET');

/** telefono vacío se envía como null: es la forma de eliminarlo (SCRUM-93 §8). */
export async function updateProfile({ nombre, apellidos, telefono }) {
  const data = await request('PATCH', { nombre, apellidos, telefono: telefono.trim() || null });
  return data.profile;
}
