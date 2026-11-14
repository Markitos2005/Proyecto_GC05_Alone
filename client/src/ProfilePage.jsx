import { useEffect, useRef, useState } from 'react';
import { getProfile, updateProfile } from './api/profile.js';
import { PasswordForm } from './PasswordForm.jsx';

/**
 * US-005 · Pantalla de perfil.
 *
 * Ya resuelto: la conexión con el backend está en api/profile.js.
 */
export function ProfilePage() {
  const [form, setForm] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [localPassword, setLocalPassword] = useState(true);
  const messageRef = useRef(null);

  function load(profile) {
    setEmail(profile.email);
    setLocalPassword(profile.tieneContrasena !== false);
    setRole(profile.rol);
    setForm({ nombre: profile.nombre, apellidos: profile.apellidos, telefono: profile.telefono ?? '' });
  }

  useEffect(() => {
    getProfile()
      .then(profile => { load(profile); setStatus('ready'); })
      .catch(error => { setStatus(error.status === 401 ? 'unauthenticated' : 'error'); setMessage(error.message); });
  }, []);

  function validate() {
    const newErrors = {};

    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!form.apellidos.trim()) newErrors.apellidos = 'Los apellidos son obligatorios.';

    const telefono = form.telefono.trim();
    if (telefono && !/^(?:\+34)?\d{9}$/.test(telefono)) {
      newErrors.telefono = 'Introduce 9 cifras, con el prefijo +34 opcional.';
    }

    return newErrors;
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    setMessage('');
    setErrors({});

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage('Revisa los datos introducidos.');
      return;
    }

    setSaving(true);

    try {
      load(await updateProfile(form));
      setMessage('Perfil actualizado correctamente.');
    } catch (error) {
      if (error.status === 401) setStatus('unauthenticated');
      setMessage(error.message);
      setErrors(error.errors || {});
    } finally {
      setSaving(false);
    }
  }

  const change = field => event => setForm(current => ({ ...current, [field]: event.target.value }));

  useEffect(() => {
    if (message) messageRef.current?.focus();
  }, [message]);

  return <main>
    <header><span className="brand">Lost&Found UEx</span><p>Objetos perdidos y encontrados</p></header>
    <section className="card" aria-labelledby="profile-title">
      <h1 id="profile-title">Mi perfil</h1>

      {status === 'loading' && <p>Cargando tu perfil…</p>}

      {status === 'unauthenticated' && <p className="error" role="alert" tabIndex="-1" ref={messageRef}>{message} <a href="#inicio-sesion">Iniciar sesión</a></p>}

      {status === 'error' && <p className="error" role="alert" tabIndex="-1" ref={messageRef}>{message}</p>}

      {status === 'ready' && <>
        <p>Correo electrónico: {email}</p>
        <p>Rol: {role}</p>

        <form onSubmit={submit} aria-busy={saving}>
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" value={form.nombre} onChange={change('nombre')} disabled={saving} aria-invalid={Boolean(errors.nombre)} aria-describedby={errors.nombre ? 'nombre-error' : undefined} />
          {errors.nombre && <p id="nombre-error" className="error" role="alert">{errors.nombre}</p>}

          <label htmlFor="apellidos">Apellidos</label>
          <input id="apellidos" value={form.apellidos} onChange={change('apellidos')} disabled={saving} aria-invalid={Boolean(errors.apellidos)} aria-describedby={errors.apellidos ? 'apellidos-error' : undefined} />
          {errors.apellidos && <p id="apellidos-error" className="error" role="alert">{errors.apellidos}</p>}

          <label htmlFor="telefono">Teléfono</label>
          <input id="telefono" type="tel" value={form.telefono} onChange={change('telefono')} disabled={saving} aria-invalid={Boolean(errors.telefono)} aria-describedby="telefono-help telefono-error" />
          <p id="telefono-help" className="help">Introduce 9 cifras, con el prefijo +34 opcional. Si lo dejas vacío, se eliminará el teléfono.</p>
          {errors.telefono && <p id="telefono-error" className="error" role="alert">{errors.telefono}</p>}

          <button type="submit" disabled={saving}>{saving ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>

        <p ref={messageRef} role="status" aria-live="polite" tabIndex="-1" className={message.includes('correctamente') ? 'success' : 'error'}>{message}</p>

        {/* US-006. AC-08: si el perfil indica que la cuenta no tiene contraseña local, no se muestra. */}
        <PasswordForm localPassword={localPassword} />
      </>}
    </section>
  </main>;
}