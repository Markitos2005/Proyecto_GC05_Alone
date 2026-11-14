/** RAÚL / SCRUM-103: módulo listo para importar en tu futuro formulario React.
 * const opciones = await getHallazgoOptions(); // facultad asignada + categorías activas
 * await publishHallazgo({ categoriaId, descripcion, fechaHallazgo: '2026-11-14',
 *   latitud: Number(latitud), longitud: Number(longitud), puntoEntrega, rasgosPrivados }, files);
 * files: File[] del input multiple, de 1 a 5 JPG/PNG, máximo 5 MiB por archivo.
 * No enviar autorId, facultadId ni estado; los fija el servidor.
 * No poner Content-Type: el navegador añade automáticamente el boundary de FormData.
 * La API usa la sesión HttpOnly existente; no tokens ni contraseñas en localStorage.
 */
async function decode(response) {
  let data;
  try { data = await response.json(); } catch { throw new Error('La respuesta del servidor no es válida.'); }
  if (!response.ok) {
    const messages = { 400: 'Revisa los datos y las imágenes.', 401: 'Debes iniciar sesión.',
      403: 'Necesitas permisos de Conserje y una facultad activa asignada.',
      413: 'Cada imagen debe ocupar como máximo 5 MiB.',
      415: 'El formulario debe incluir datos e imágenes.',
      429: 'Demasiadas solicitudes. Inténtalo más tarde.',
      503: 'La publicación está pendiente de conectar con el almacenamiento de SCRUM-105.' };
    const error = new Error(messages[response.status] ?? 'No se ha podido publicar el hallazgo.');
    error.status = response.status;
    // Raúl: errores por campo con claves categoriaId, descripcion, fechaHallazgo,
    // latitud, longitud, puntoEntrega, rasgosPrivados o imagenes. Renderizar como texto.
    error.errors = data?.errors && typeof data.errors === 'object' ? data.errors : {};
    throw error;
  }
  return data;
}

async function send(path, options) {
  let response;
  try { response = await fetch(path, { credentials: 'same-origin', ...options }); }
  catch { throw new Error('No se pudo conectar con el servidor. Inténtalo de nuevo.'); }
  return decode(response);
}

export function getHallazgoOptions() { return send('/api/hallazgos/opciones'); }

export function publishHallazgo(datos, files) {
  const form = new FormData();
  form.append('datos', JSON.stringify(datos));
  for (const file of files) form.append('imagenes', file);
  return send('/api/hallazgos', { method: 'POST', body: form });
}
