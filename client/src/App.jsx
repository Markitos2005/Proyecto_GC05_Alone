import { useEffect, useState } from 'react';
import { RegistrationForm } from './RegistrationForm.jsx';
import { LoginForm } from './LoginForm.jsx';

/** Navegación mínima sin dependencias adicionales ni rutas del servidor. */
export function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  return hash === '#inicio-sesion' ? <LoginForm /> : <RegistrationForm />;
}
