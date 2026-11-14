/** US-010 · Gestión de hallazgos propios (API de SCRUM-114), usada por MyFindingsPage (SCRUM-113).
 * Usa la sesión HttpOnly existente. Los errores conservan status, el mensaje del servidor y errors por campo.
 */
const fallback = {
  401: 'Tu sesión ha caducado. Inicia sesión de nuevo.',
  404: 'Hallazgo no encontrado.',
  409: 'Este hallazgo ya no está activo y no se puede modificar.',
  429: 'Demasiadas peticiones. Inténtalo más tarde.',
  503: 'La gestión de hallazgos no está disponible en este momento.',
};

async function send(path, options = {}) {
  let response;
  try {
    response = await fetch(path, { credentials: 'same-origin', ...options });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Inténtalo de nuevo.');
  }
  let data = null;
  try { data = await response.json(); } catch { /* respuesta sin JSON */ }
  if (!response.ok) {
    const serverMessage = typeof data?.message === 'string' ? data.message : '';
    const error = new Error(response.status === 401 ? fallback[401]
      : serverMessage || fallback[response.status] || 'No se ha podido completar la operación.');
    error.status = response.status;
    error.errors = data?.errors && typeof data.errors === 'object' ? data.errors : {};
    throw error;
  }
  if (!data) throw new Error('La respuesta del servidor no es válida.');
  return data;
}

const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const path = (id, suffix = '') => `/api/hallazgos/${encodeURIComponent(id)}${suffix}`;

export const listMyHallazgos = () => send('/api/hallazgos/mios');
export const getMyHallazgo = (id) => send(path(id));
export const getMyHallazgoHistory = (id) => send(path(id, '/historial'));
/** cambios: solo los campos modificados (facultadId, categoriaId, descripcion, fechaHallazgo, latitud, longitud, puntoEntrega, rasgosPrivados). */
export const updateMyHallazgo = (id, cambios) => send(path(id), json('PATCH', cambios));
/** estado: 'Devuelto' o 'Retirado'. motivo opcional. */
export const changeMyHallazgoState = (id, estado, motivo) => send(path(id, '/estado'), json('PATCH', motivo ? { estado, motivo } : { estado }));
export const myHallazgoImageUrl = (id, imagenId) => path(id, `/imagenes/${encodeURIComponent(imagenId)}`);
