# US-005 · Perfil de usuario (SCRUM-91)

Referencia: [diseño SCRUM-93](../technical-design/SCRUM-93-perfil.md), [diseño de sesión SCRUM-88](../technical-design/SCRUM-88-inicio-sesion.md) y [criterios US-005](../../specs/EP-001/spec.md).

## Alcance

- Pantalla `#perfil`: **versión base** ya conectada al backend (carga, guardado, caso sin sesión). La completa el responsable del frontend del perfil siguiendo la lista TODO de `client/src/ProfilePage.jsx`. Toda la integración HTTP está en `client/src/api/profile.js` y no necesita cambios. Tras iniciar sesión, la aplicación navega a esta pantalla.
- El registro (US-001) pide ahora también nombre y apellidos, para que el perfil tenga datos desde el alta.
- `requireAuth` (`server/src/security/auth.js`): middleware reutilizable para cualquier ruta privada. Responde 401 sin sesión y, en cada petición, comprueba que la cuenta existe y está activa; si no, destruye la sesión.

## Decisiones

| Tema | Decisión |
| --- | --- |
| Modelo | Migración `003-perfil.sql` añade `nombre` (100), `apellidos` (150) y `telefono` (12) a `usuarios`. Nullables en BD para no romper cuentas anteriores; la obligatoriedad la aplica el servidor. |
| Cuentas anteriores | El perfil devuelve `nombre`/`apellidos` vacíos; el formulario exige rellenarlos al guardar. |
| Teléfono | `^(?:\+34)?[0-9]{9}$` tras recortar espacios exteriores. `null` lo elimina; omitirlo lo conserva. En la interfaz, dejar el campo vacío envía `null`. |
| Campos no editables | `email`, `rol`, `id`, `activo` y cualquier otra propiedad se **rechazan con 400** en lugar de ignorarse. |
| Identidad | El usuario sale siempre de `req.session.userId`; ninguna ruta recibe un id del cliente. |
| CSRF | `PATCH` exige `application/json` (un formulario de otro sitio no puede enviarlo sin preflight CORS, que no está habilitado) y la cookie es `SameSite=Lax`. El token CSRF del diseño queda pendiente. |

## Contrato API

`GET /api/profile/me` → 200 `{ id, email, nombre, apellidos, telefono, rol }`.

`PATCH /api/profile/me` con cualquier subconjunto de `{ nombre, apellidos, telefono }` → 200 `{ message, profile }`.

Errores: 400 con `errors.<campo>`, 401 sin sesión, 404 perfil inexistente, 415 si no es JSON, 500 genérico.

`POST /api/auth/register` exige además `nombre` y `apellidos` (400 con `errors.nombre` / `errors.apellidos`).

## Probar

Con `.env` configurado (incluido `SESSION_SECRET`) y la BD arrancada: `npm.cmd run db:migrate` y `npm.cmd run dev`. Registrarse en `#registro`, iniciar sesión en `#inicio-sesion` y editar el perfil.

Pruebas automáticas: `server/tests/profile.test.js` (contrato HTTP con sesión real) y `client/src/ProfilePage.test.jsx`; `npm.cmd run test:db` comprueba que nombre y apellidos se guardan en PostgreSQL.

## Pendiente

- Aprobación del PO para el cambio de alcance de US-001 (nombre y apellidos en el registro).
- Token CSRF para operaciones con cookie.
- Cierre de sesión (US-003): hoy no hay botón en el perfil.
