import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from './api/profile.js';

/**
 * US-005 · Pantalla de perfil (base para completar).
 *
 * Ya resuelto: la conexión con el backend está en api/profile.js.
 *   - getProfile()  → { id, email, nombre, apellidos, telefono, rol }
 *   - updateProfile({ nombre, apellidos, telefono }) → perfil actualizado.
 *     Un teléfono vacío se envía como null (lo elimina).
 *   - Ambas lanzan ProfileApiError con .status (401, 400...), .message y .errors
 *     (mensajes por campo del servidor: errors.nombre, errors.apellidos, errors.telefono).
 * El servidor identifica al usuario por la sesión: no hay que enviar ningún id.
 *
 * TODO (pantalla):
 *   - Mostrar errors.<campo> junto a cada input (aria-invalid, aria-describedby).
 *   - Estado de envío: desactivar el formulario y evitar doble envío mientras guarda.
 *   - Validación en cliente: nombre y apellidos obligatorios; teléfono 9 cifras con +34 opcional.
 *   - Texto de ayuda del teléfono y forma clara de eliminarlo.
 *   - Mostrar el rol; foco y aria-live en los mensajes; estilos coherentes con registro/login.
 */
export function ProfilePage() {
  const [form, setForm] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  function load(profile) {
    setEmail(profile.email);
    setForm({ nombre: profile.nombre, apellidos: profile.apellidos, telefono: profile.telefono ?? '' });
  }

  useEffect(() => {
    getProfile()
      .then(profile => { load(profile); setStatus('ready'); })
      .catch(error => { setStatus(error.status === 401 ? 'unauthenticated' : 'error'); setMessage(error.message); });
  }, []);

  async function submit(event) {
    event.preventDefault();
    try {
      load(await updateProfile(form));
      setMessage('Perfil actualizado correctamente.');
    } catch (error) {
      if (error.status === 401) setStatus('unauthenticated');
      setMessage(error.message);
    }
  }

  const change = field => event => setForm(current => ({ ...current, [field]: event.target.value }));

  return <main>
    <header><span className="brand">Lost&Found UEx</span><p>Objetos perdidos y encontrados</p></header>
    <section className="card" aria-labelledby="profile-title">
      <h1 id="profile-title">Mi perfil</h1>
      {status === 'loading' && <p>Cargando tu perfil…</p>}
      {status === 'unauthenticated' && <p>{message} <a href="#inicio-sesion">Iniciar sesión</a></p>}
      {status === 'error' && <p className="error">{message}</p>}
      {status === 'ready' && <>
        <p>Correo electrónico: {email}</p>
        <form onSubmit={submit}>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" value={form.nombre} onChange={change('nombre')} />
          <label htmlFor="apellidos">Apellidos</label>
          <input id="apellidos" value={form.apellidos} onChange={change('apellidos')} />
          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" type="tel" value={form.telefono} onChange={change('telefono')} />
          <button type="submit">Guardar cambios</button>
        </form>
        <p role="status">{message}</p>
      </>}
    </section>
  </main>;
}
