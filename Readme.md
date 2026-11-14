# Lost&Found UEx

Monolito JavaScript: backend Express, frontend React y PostgreSQL. Implementación actual: registro local US-001 (SCRUM-83), según el diseño SCRUM-85.

La [guía del registro](docs/development/US-001-registro.md) explica instalación, configuración, estructura, contrato API y pruebas para SCRUM-84. Inicio de sesión: [US-002](docs/development/US-002-inicio-sesion.md). Perfil: [US-005](docs/development/US-005-perfil.md).

Inicio rápido con Node.js 22.12+ y Docker Desktop activo:

```powershell
npm.cmd ci
Copy-Item .env.example .env
docker compose up -d --wait db
npm.cmd run db:migrate
npm.cmd run dev
```

Si `.env` ya existe, conservarlo y revisar sus valores. Usar únicamente datos ficticios. Para ejecutar el monolito compilado: `npm.cmd run build` y `npm.cmd start`.

Pruebas: `npm.cmd test` (API y React), `npm.cmd run test:db` (PostgreSQL real independiente), `npm.cmd run test:monolith` (arranque compilado, archivos React y registro HTTP).

Publicar hallazgos (SCRUM-49, US-008): API preparada; tabla y almacenamiento de fotos pendientes de Raúl en SCRUM-105 y formulario en SCRUM-103. Sin conectar SCRUM-105 devuelve 503, no guarda ni simula publicaciones. No hay nuevas migraciones ni categorías de ejemplo.

- Raúl: completar las dos operaciones de `server/src/repositories/hallazgos.js`. El contrato y las garantías de guardado atómico están comentados allí. El repositorio se conecta desde `server/src/index.js`.
- `GET /api/hallazgos/opciones`: sesión de Conserje; devuelve `{ facultad: { id, nombre }, categorias: [{ id, nombre }] }` de su asignación y categorías activas.
- `POST /api/hallazgos`: sesión de Conserje y origen permitido; multipart con un campo `datos` (JSON) y entre 1 y 5 archivos `imagenes`, JPG/PNG de hasta 5 MiB cada uno. JSON: `{ "categoriaId": "UUID-de-categoria", "descripcion": "Objeto ficticio", "fechaHallazgo": "2026-01-01", "latitud": 0, "longitud": 0, "puntoEntrega": "Conserjería ficticia", "rasgosPrivados": "No publicar" }`. Los dos últimos textos son opcionales. Autor, facultad y estado los fija el servidor.
- Límites técnicos del contrato: textos de hasta 2000 caracteres, fecha existente no futura (UTC), coordenadas numéricas y hasta 16 megapíxeles por foto. Sharp verifica el contenido y retira metadatos antes de entregar los buffers al almacenamiento. Estos límites técnicos no son nuevas estimaciones ni funcionalidades del profesor.
- Respuesta 201: `{ message: "Hallazgo publicado correctamente.", hallazgo: { id, estado: "Activo" } }`. No devuelve rasgos privados ni los buffers de imágenes. Errores 400 de campos incluyen `errors`; también puede responder 401, 403, 413, 415, 429, 503 y 500.
- Raúl: importar `getHallazgoOptions` y `publishHallazgo` de `client/src/api/hallazgos.js`. Este módulo construye FormData e incluye la cookie. No establecer manualmente Content-Type. No se han creado pantallas de SCRUM-103.
- `server/tests/hallazgos.postgres.test.js` comprueba usuarios/sesiones reales y el contrato con un almacenamiento de hallazgos simulado de forma explícita. La persistencia definitiva de hallazgos y fotos deberá probarse al completar SCRUM-105.

Recuperación de contraseña (SCRUM-43, API; SCRUM-94, pantallas React):

- Arrancar el buzón local con `docker compose up -d mail` y abrir `http://localhost:8025`. Solo captura correos de pruebas; no los entrega por Internet.
- Conservar el `.env` existente y añadir `SMTP_TEST_PORT=1025` y `RECOVERY_APP_ORIGIN=http://localhost:5173` (usar `http://localhost:3000` para el monolito compilado). Ejecutar `npm.cmd run db:migrate` para preparar las tablas sin borrar los datos.
- `POST /api/auth/forgot-password`, JSON `{ "email": "persona@example.com" }`: devuelve la misma confirmación para cuentas elegibles, inexistentes, inactivas y solicitudes limitadas por correo. El enlace aparece solo en el buzón de pruebas. Si SMTP falla se registra un error genérico y se conserva la misma confirmación; no se garantiza la entrega.
- `POST /api/auth/reset-password`, JSON `{ "token": "token-del-correo", "password": "Nueva1234", "confirmPassword": "Nueva1234" }`: cambia la contraseña, consume el enlace y elimina las sesiones de la cuenta en una sola transacción. No inicia sesión automáticamente.
- Desde el inicio de sesión, pulsar «He olvidado mi contraseña», solicitar el enlace y abrirlo en Mailpit. El enlace `/#restablecer-contrasena?token=...` abre el formulario de nueva contraseña. Tras completar el cambio se elimina el token de la URL y se vuelve al inicio de sesión, sin autenticar automáticamente.
- Al abrirlo se comprueba su vigencia con `POST /api/auth/validate-reset-token`, JSON `{ "token": "token-del-correo" }`. Si ha caducado, se ha sustituido o se ha usado, se muestra «Enlace expirado o no válido» sin mostrar el formulario. Esta consulta no consume el enlace; al guardar la contraseña se vuelve a validar dentro de la transacción.
- La prueba `server/tests/recovery.postgres.test.js` verifica el servidor con PostgreSQL y un buzón SMTP efímero, sin necesitar Docker ni enviar mensajes reales. Las pruebas de `client/src/RecoveryForms.test.jsx` verifican las pantallas y el contrato HTTP.
