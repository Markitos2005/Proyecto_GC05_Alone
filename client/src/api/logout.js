/** SCRUM-90: Ángel invalida la sesión y elimina la cookie en el servidor. */
export async function logout({ csrfToken } = {}) {
  // Integración pendiente: pasar el token cuando Ángel concrete el mecanismo CSRF.
  // El nombre de cabecera debe confirmarse con su API; no se inventa un endpoint de token.
  const headers = csrfToken ? { 'X-CSRF-Token': csrfToken } : {};
  let response;
  try {
    response = await fetch('/api/auth/logout', {
      method: 'POST', credentials: 'same-origin', headers,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. No se ha podido confirmar el cierre de sesión.');
  }
  // 401 indica que ya no hay sesión válida. Un 403 (CSRF) no confirma el cierre.
  if (response.status === 401) return;
  if (response.status !== 200) {
    throw new Error(response.status === 404
      ? 'El servicio de cierre de sesión todavía no está disponible.'
      : 'No se ha podido cerrar la sesión. Inténtalo de nuevo.');
  }
}
