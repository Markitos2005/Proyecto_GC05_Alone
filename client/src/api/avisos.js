/** Luis / SCRUM-52: módulo HTTP listo para importar desde el formulario React.
 * await getAvisoOptions() -> { categorias, facultades, centros }.
 * await publishAviso({ categoriaId, facultadId, centroId, descripcion, fechaPerdida,
 *   rasgosPrivados, contactoEmail, contactoTelefono }).
 * Se exige facultadId o centroId; si se envían ambos, el centro debe ser de esa facultad.
 * Los cuatro campos opcionales pueden omitirse o enviarse vacíos/null.
 * La sesión ya existente viaja por cookie: no enviar autorId, estado ni tokens.
 * Con 201 mostrar confirmación. No reenviar automáticamente un POST que falle por red.
 * Con 400 mostrar error.errors[campo] como texto junto a cada control; con 401 volver al login.
 * Mostrar en el formulario: «Este aviso no inicia una solicitud de recuperación ni
 * implica que el objeto esté bajo custodia de la Universidad» (US-013-AC-07).
 * No incluir correo de la cuenta por defecto ni publicar los rasgos/contactos en el feed.
 */
export class AvisoApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
const messages = {
  400: 'Revisa los datos del aviso.', 401: 'Debes iniciar sesión para publicar un aviso.',
  403: 'Origen de la petición no permitido.', 413: 'El aviso es demasiado grande.',
  415: 'Envía el aviso en formato JSON.', 429: 'Demasiadas publicaciones. Inténtalo más tarde.',
  503: 'La publicación de avisos no está disponible en este momento.',
};
async function request(path, body) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...(body !== undefined && { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new AvisoApiError(0, 'No se pudo conectar con el servidor. Comprueba la conexión.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const isFeed = path.startsWith('/api/avisos?');

    const feedMessages = {
      400: 'Revisa los parámetros de paginación.',
      401: 'Debes iniciar sesión para consultar los avisos.',
      404: 'La página solicitada no existe.',
      503: 'La consulta de avisos no está disponible en este momento.',
    };

    throw new AvisoApiError(
      response.status,
      (isFeed ? feedMessages[response.status] : null) ||
        messages[response.status] ||
        'No se ha podido completar la operación.',
      response.status === 400 ? data?.errors ?? {} : {}
    );
  }
  if (!data) throw new AvisoApiError(response.status, 'La respuesta del servidor no es válida.');
  return data;
}
export const getAvisoOptions = () => request('/api/avisos/opciones');
export const publishAviso = datos => request('/api/avisos', datos);

// SCRUM-57 / US-014: consulta paginada del feed de avisos.
export function getAvisos(pagina = 1, tamano = 12) {
  const params = new URLSearchParams({
    pagina: String(pagina),
    tamano: String(tamano),
  });

  return request(`/api/avisos?${params.toString()}`);
}