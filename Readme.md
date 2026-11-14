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

Publicar hallazgos (US-008: SCRUM-49, API; SCRUM-105, almacenamiento; SCRUM-103, formulario):

- Tras actualizar, ejecutar `npm.cmd run db:migrate` (migración `007-hallazgos.sql`). Crea `hallazgos`, `hallazgo_rasgos_privados` y `hallazgo_imagenes`, y el mínimo de `facultades`, `categorias` y `asignaciones_conserje` que necesita la publicación. No inserta datos de ejemplo: su administración llegará con US-023 y US-025.
- Solo publica una cuenta con rol `CONSERJE`, activa y asignada a una facultad activa. El servidor vuelve a comprobar rol, asignación y categoría dentro de la transacción.
- Hallazgo, rasgos privados y fotos se guardan en una única transacción de PostgreSQL: si algo falla, no queda nada guardado. Las fotos se guardan en la base de datos (BYTEA) ya verificadas y sin metadatos; nunca se usa el nombre del archivo del cliente.
- Los rasgos privados van en su propia tabla y no se devuelven en ninguna respuesta pública.
- `GET /api/hallazgos/opciones`: sesión de Conserje; devuelve `{ facultad: { id, nombre }, categorias: [{ id, nombre }] }` de su asignación y categorías activas.
- `POST /api/hallazgos`: sesión de Conserje y origen permitido; multipart con un campo `datos` (JSON) y entre 1 y 5 archivos `imagenes`, JPG/PNG de hasta 5 MiB cada uno. JSON: `{ "categoriaId": "UUID-de-categoria", "descripcion": "Objeto ficticio", "fechaHallazgo": "2026-01-01", "latitud": 0, "longitud": 0, "puntoEntrega": "Conserjería ficticia", "rasgosPrivados": "No publicar" }`. Los dos últimos textos son opcionales. Autor, facultad y estado los fija el servidor.
- Límites técnicos del contrato: textos de hasta 2000 caracteres, fecha existente no futura (UTC), coordenadas numéricas y hasta 16 megapíxeles por foto.
- Respuesta 201: `{ message: "Hallazgo publicado correctamente.", hallazgo: { id, estado: "Activo" } }`. Errores 400 de campos incluyen `errors`; también puede responder 401, 403, 413, 415, 429 y 500.
- Pruebas: `server/tests/hallazgos.test.js` (API), `server/tests/hallazgos.postgres.test.js` (permisos con sesiones reales) y `server/tests/hallazgos-storage.postgres.test.js` (guardado atómico, rasgos separados y fotos sin metadatos).

Recuperación de contraseña (SCRUM-43, API; SCRUM-94, pantallas React):

- Arrancar el buzón local con `docker compose up -d mail` y abrir `http://localhost:8025`. Solo captura correos de pruebas; no los entrega por Internet.
- Conservar el `.env` existente y añadir `SMTP_TEST_PORT=1025` y `RECOVERY_APP_ORIGIN=http://localhost:5173` (usar `http://localhost:3000` para el monolito compilado). Ejecutar `npm.cmd run db:migrate` para preparar las tablas sin borrar los datos.
- `POST /api/auth/forgot-password`, JSON `{ "email": "persona@example.com" }`: devuelve la misma confirmación para cuentas elegibles, inexistentes, inactivas y solicitudes limitadas por correo. El enlace aparece solo en el buzón de pruebas. Si SMTP falla se registra un error genérico y se conserva la misma confirmación; no se garantiza la entrega.
- `POST /api/auth/reset-password`, JSON `{ "token": "token-del-correo", "password": "Nueva1234", "confirmPassword": "Nueva1234" }`: cambia la contraseña, consume el enlace y elimina las sesiones de la cuenta en una sola transacción. No inicia sesión automáticamente.
- Desde el inicio de sesión, pulsar «He olvidado mi contraseña», solicitar el enlace y abrirlo en Mailpit. El enlace `/#restablecer-contrasena?token=...` abre el formulario de nueva contraseña. Tras completar el cambio se elimina el token de la URL y se vuelve al inicio de sesión, sin autenticar automáticamente.
- Al abrirlo se comprueba su vigencia con `POST /api/auth/validate-reset-token`, JSON `{ "token": "token-del-correo" }`. Si ha caducado, se ha sustituido o se ha usado, se muestra «Enlace expirado o no válido» sin mostrar el formulario. Esta consulta no consume el enlace; al guardar la contraseña se vuelve a validar dentro de la transacción.
- La prueba `server/tests/recovery.postgres.test.js` verifica el servidor con PostgreSQL y un buzón SMTP efímero, sin necesitar Docker ni enviar mensajes reales. Las pruebas de `client/src/RecoveryForms.test.jsx` verifican las pantallas y el contrato HTTP.
