/** Contrato SCRUM-88. Ángel implementa este endpoint y la sesión en el servidor.
 * Vite ya redirige /api al backend; en el monolito se utiliza el mismo origen.
 * La cookie HttpOnly la administra el navegador, nunca localStorage.
 */
export async function login({ email, password }) {
  let response;
  try {
    response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.');
  }

  const messages = {
    400: 'Datos de acceso inválidos.',
    401: 'Credenciales incorrectas.',
    404: 'El servicio de inicio de sesión todavía no está disponible.',
    429: 'Demasiados intentos. Inténtalo más tarde.',
  };
  if (!response.ok) {
    // Mensajes controlados: un 401 nunca revela si existe la cuenta.
    throw new Error(messages[response.status] || 'No se ha podido completar la operación.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('La respuesta del servidor no es válida.');
  }
  if (!data?.user || typeof data.user.id !== 'string' ||
      typeof data.user.email !== 'string' || typeof data.user.rol !== 'string') {
    throw new Error('La respuesta del servidor no es válida.');
  }
  return data.user;
}
