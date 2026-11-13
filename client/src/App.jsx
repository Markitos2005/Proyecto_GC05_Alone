import { useEffect, useState } from 'react';
import { RegistrationForm } from './RegistrationForm.jsx';
import { LoginForm } from './LoginForm.jsx';
import { ProfilePage } from './ProfilePage.jsx';

/** Navegación mínima sin dependencias adicionales ni rutas del servidor. */
export function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);
  if (hash === '#inicio-sesion') return <LoginForm />;
  if (hash === '#perfil') return <ProfilePage />;
  return <RegistrationForm />;
}
