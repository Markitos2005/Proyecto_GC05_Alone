/** US-008 · API de publicación de hallazgos (SCRUM-49), usada por PublishFindingPage (SCRUM-103).
 * getHallazgoOptions(): { facultades: [{ id, nombre }], categorias: [{ id, nombre }] } activas.
 * publishHallazgo({ facultadId, categoriaId, descripcion, fechaHallazgo, latitud, longitud,
 *   puntoEntrega, rasgosPrivados }, files): files son de 1 a 5 JPG/PNG de hasta 5 MiB.
 * No enviar autorId ni estado; los fija el servidor.
 * No poner Content-Type: el navegador añade automáticamente el boundary de FormData.
 * La API usa la sesión HttpOnly existente; no tokens ni contraseñas en localStorage.
 */
async function decode(response) {
  let data;
  try { data = await response.json(); } catch { throw new Error('La respuesta del servidor no es válida.'); }
  if (!response.ok) {
    const messages = { 400: 'Revisa los datos y las imágenes.', 401: 'Tu sesión ha caducado. Inicia sesión de nuevo.',
      403: 'Tu cuenta no puede publicar hallazgos.',
      413: 'Cada imagen debe ocupar como máximo 5 MiB.',
      415: 'El formulario debe incluir datos e imágenes.',
      429: 'Demasiadas publicaciones. Inténtalo más tarde.',
      503: 'La publicación de hallazgos no está disponible en este momento.' };
    const error = new Error(messages[response.status] ?? 'No se ha podido publicar el hallazgo.');
    error.status = response.status;
    // Errores por campo: facultadId, categoriaId, descripcion, fechaHallazgo, latitud,
    // longitud, puntoEntrega, rasgosPrivados o imagenes. Se muestran siempre como texto.
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
