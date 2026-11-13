
import { useEffect, useState } from 'react';
import { RegistrationForm } from './RegistrationForm.jsx';
import { LoginForm } from './LoginForm.jsx';
import { ProfilePage } from './ProfilePage.jsx';
import { HomePage } from './HomePage.jsx';

/** Navegación de registro, inicio de sesión, perfil y cierre de sesión. */
export function App() {
  const [hash, setHash] = useState(() => window.location.hash);
  const [user, setUser] = useState(null);
  const [demo, setDemo] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener('hashchange', update);

    return () => window.removeEventListener('hashchange', update);
  }, []);

  useEffect(() => {
    window.scrollTo?.(0, 0);
  }, [hash]);

  function navigate(destination) {
    window.location.hash = destination;
    setHash(destination);
  }

  function authenticated(account) {
    setUser(account);
    setDemo(false);
    setNotice('');
    navigate('#app');
  }

  function closed() {
    setUser(null);
    setNotice(
      demo
        ? 'Demostración terminada. Puedes iniciar sesión o crear una cuenta.'
        : 'Sesión cerrada correctamente.',
    );
    setDemo(false);

    window.history.replaceState(null, '', '#portada');
    setHash('#portada');
  }

  function preview() {
    setUser({
      id: 'demo',
      email: 'demo@example.com',
      rol: 'USUARIO',
    });
    setDemo(true);
    setNotice('');
    navigate('#app');
  }

  // Registro e inicio de sesión.
  if (!user && hash === '#registro') {
    return <RegistrationForm />;
  }

  if (!user && hash === '#inicio-sesion') {
    return <LoginForm onLogin={authenticated} />;
  }

  // Perfil real: el backend comprueba que exista una sesión válida.
  // No se permite consultar el perfil desde la demostración.
  if (hash === '#perfil' && !demo) {
    return <ProfilePage />;
  }

  // Portada pública o pantalla del usuario autenticado.
  return (
    <HomePage
      user={user}
      demo={demo}
      onLogout={closed}
      onDemo={!user && import.meta.env.DEV ? preview : undefined}
      notice={notice}
    />
  );
}