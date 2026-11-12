import { useRef, useState } from 'react';

/** Formulario US-001. No guarda credenciales en almacenamiento del navegador. */
export function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const feedback = useRef(null);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setErrors({});
    setMessage('');
    setSuccess(false);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setMessage('Cuenta creada correctamente. Ya está preparada para iniciar sesión.');
        setEmail('');
      } else {
        setErrors(data.errors || {});
        setMessage(data.message || 'No se ha podido completar el registro.');
      }
    } catch {
      setMessage('No se pudo conectar con el servidor. Comprueba la conexión e inténtalo de nuevo.');
    } finally {
      setPassword('');
      setShowPassword(false);
      setPending(false);
      submitting.current = false;
      feedback.current?.focus();
    }
  }

  return <main>
    <header><span className="brand">Lost&Found UEx</span><p>Objetos perdidos y encontrados</p></header>
    <section className="card" aria-labelledby="title">
      <h1 id="title">Crea tu cuenta</h1>
      <p>Regístrate con tu correo electrónico y una contraseña.</p>
      <form onSubmit={submit} aria-busy={pending}>
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={254}
          value={email} onChange={e => setEmail(e.target.value)} disabled={pending}
          aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
        {errors.email && <p id="email-error" className="error">{errors.email}</p>}
        <label htmlFor="password">Contraseña</label>
        <div className="password-field">
        <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required
          minLength={8} maxLength={128} pattern="(?=.*\p{L})(?=.*[0-9]).{8,128}"
          value={password} onChange={e => setPassword(e.target.value)} disabled={pending}
          aria-invalid={Boolean(errors.password)} aria-describedby="password-help password-error" />
        <button type="button" className="password-toggle" disabled={pending}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-controls="password" aria-pressed={showPassword}
          onClick={() => setShowPassword(visible => !visible)}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {!showPassword && <path d="m3 3 18 18" />}
          </svg>
        </button>
        </div>
        <p id="password-help" className="help">Entre 8 y 128 caracteres, con al menos una letra y un número.</p>
        <p id="password-error" className="error">{errors.password}</p>
        <button disabled={pending} type="submit">{pending ? 'Creando cuenta…' : 'Crear cuenta'}</button>
      </form>
      <div ref={feedback} tabIndex={-1} role="status" aria-live="polite" className={success ? 'success' : 'error'}>{message}</div>
      <p>¿Ya tienes cuenta? <a href="#inicio-sesion">Iniciar sesión</a></p>
    </section>
  </main>;
}
