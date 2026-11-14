/** SCRUM-94: conecta exclusivamente con la API real de SCRUM-43. */
async function postRecovery(path, body) {
  let response;
  try {
    response = await fetch(`/api/auth/${path}`, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo de nuevo.');
  }
  if (!response.ok) {
    if (response.status === 429) throw new Error('Demasiados intentos. Inténtalo más tarde.');
    if (response.status === 400 && path === 'validate-reset-token') {
      const error = new Error('Enlace expirado o no válido. Solicita uno nuevo.');
      error.invalidToken = true;
      throw error;
    }
    if (response.status === 400) throw new Error(path === 'reset-password'
      ? 'El enlace no es válido o ha caducado. Solicita uno nuevo y comprueba la contraseña.'
      : 'Introduce un correo válido.');
    throw new Error('No se ha podido completar la operación. Inténtalo más tarde.');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('La respuesta del servidor no es válida.'); }
  if (typeof data?.message !== 'string' || !data.message.trim()) {
    throw new Error('La respuesta del servidor no es válida.');
  }
  // No presentar contenido arbitrario del servidor ni datos sensibles.
}

export function requestRecovery(email) {
  return postRecovery('forgot-password', { email: email.trim().toLowerCase() });
}

export function resetPassword({ token, password, confirmPassword }) {
  return postRecovery('reset-password', { token, password, confirmPassword });
}

// POST evita incluir el secreto en la URL de una petición o consumir el enlace al abrirlo.
export function validateRecoveryToken(token) {
  return postRecovery('validate-reset-token', { token });
}
