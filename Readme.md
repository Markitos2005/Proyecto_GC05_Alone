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

- Tras actualizar, ejecutar `npm.cmd run db:migrate` (migración `007-hallazgos.sql`) y, solo en desarrollo, `npm.cmd run db:seed-dev`, que carga unas facultades y categorías iniciales hasta que US-023 permita administrarlas. Es idempotente.
- Pantalla: con sesión iniciada, «Publicar un hallazgo» en la portada (`#publicar-hallazgo`).
- Cualquier cuenta autenticada y activa puede publicar y elige la facultad donde se entregará el objeto. La tabla `asignaciones_conserje` queda preparada para cuando la publicación se reserve a Conserjería (US-025).
- Hallazgo, rasgos privados y fotos se guardan en una única transacción de PostgreSQL: si algo falla, no queda nada guardado. El servidor vuelve a comprobar cuenta, facultad y categoría dentro de la transacción. Las fotos se guardan en la base de datos (BYTEA) ya verificadas y sin metadatos; nunca se usa el nombre del archivo del cliente.
- Los rasgos privados van en su propia tabla y no se devuelven en ninguna respuesta pública.
- `GET /api/hallazgos/opciones`: con sesión; devuelve `{ facultades: [{ id, nombre }], categorias: [{ id, nombre }] }` activas.
- `POST /api/hallazgos`: con sesión y origen permitido; multipart con un campo `datos` (JSON) y entre 1 y 5 archivos `imagenes`, JPG/PNG de hasta 5 MiB cada uno. JSON: `{ "facultadId": "UUID-de-facultad", "categoriaId": "UUID-de-categoria", "descripcion": "Objeto ficticio", "fechaHallazgo": "2026-01-01", "latitud": 0, "longitud": 0, "puntoEntrega": "Conserjería ficticia", "rasgosPrivados": "No publicar" }`. Los dos últimos textos son opcionales. Autor y estado los fija el servidor.
- Límites técnicos del contrato: textos de hasta 2000 caracteres, fecha existente no futura (UTC), coordenadas numéricas y hasta 16 megapíxeles por foto.
- Respuesta 201: `{ message: "Hallazgo publicado correctamente.", hallazgo: { id, estado: "Activo" } }`. Errores 400 de campos incluyen `errors`; también puede responder 401, 403, 413, 415, 429 y 500.
- Pruebas: `server/tests/hallazgos.test.js` (API), `client/src/PublishFindingPage.test.jsx` (formulario), `server/tests/hallazgos.postgres.test.js` (sesiones reales) y `server/tests/hallazgos-storage.postgres.test.js` (guardado atómico, rasgos separados y fotos sin metadatos).

Buscar hallazgos (US-009: SCRUM-107, API; SCRUM-51, pantalla):

- `GET /api/hallazgos`: con sesión. Solo hallazgos `Activo`, del más reciente al más antiguo. Parámetros opcionales: `q` (palabras de la descripción pública, hasta 100 caracteres; deben aparecer todas, sin distinguir mayúsculas), `categoriaId`, `facultadId`, `fechaDesde` y `fechaHasta` (`AAAA-MM-DD`, fecha del hallazgo, ambas incluidas), `pagina` (desde 1), `tamano` (1–50, por defecto 12) y `corte`. Un parámetro desconocido o repetido responde 400.
- Respuesta 200: `{ hallazgos: [{ id, categoria: { id, nombre }, facultad: { id, nombre }, descripcion, fechaHallazgo, ubicacion: { latitud, longitud, puntoEntrega }, estado, publicadoEn, imagenes: ["/api/hallazgos/{id}/imagenes/1"] }], paginacion: { pagina, tamano, total, totalPaginas, anterior, siguiente, corte } }`. `anterior` y `siguiente` son números de página o `null`.
- Paginación: enviar en las páginas siguientes el mismo `corte` que devolvió la primera. Así los hallazgos publicados mientras tanto no desplazan resultados (sin duplicados ni huecos). Una búsqueda nueva o un cambio de filtros se hace sin `corte`.
- Sin resultados: 200 con `hallazgos: []` y `message` («Todavía no hay hallazgos activos.» o «No hay hallazgos activos que coincidan con la búsqueda.»). Página inexistente: 404 «La página solicitada no existe.» con `errors.pagina`. Filtros no válidos: 400 con `errors` por campo. También 401, 429 y 503.
- Privacidad: nunca se devuelven rasgos privados, autor ni correo, y los rasgos no son buscables. Las coordenadas se redondean a 3 decimales (unos 100 m).
- `GET /api/hallazgos/{id}/imagenes/{1-5}`: con sesión; devuelve la foto (JPG/PNG) si el hallazgo sigue Activo, si no 404. Las URL de `imagenes` sirven directamente para `<img src>`.
- Pruebas: `server/tests/hallazgos-busqueda.test.js` (API y validación) y `server/tests/hallazgos-busqueda.postgres.test.js` (paginación con cero, uno y varios bloques, corte, filtros y estados en PostgreSQL real).

Gestionar hallazgos propios (US-010: SCRUM-114, API; SCRUM-113, pantalla):

- Tras actualizar, ejecutar `npm.cmd run db:migrate` (migración `008-historial-hallazgos.sql`).
- Pantalla: con sesión iniciada, «Mis hallazgos» en la portada (`#mis-hallazgos`). Lista los hallazgos propios en cualquier estado. El detalle muestra fotos, rasgos privados e historial. Mientras el hallazgo está Activo se puede editar, marcar como devuelto o retirar, con motivo opcional y confirmación. Un hallazgo Devuelto o Retirado no se puede volver a activar.
- `GET /api/hallazgos/mios`: con sesión; `{ hallazgos: [{ id, descripcion, fechaHallazgo, estado, categoria, facultad, publicadoEn, imagen }] }`, del más reciente al más antiguo. `imagen` es la URL de la primera foto o `null`.
- Solo para el autor (un hallazgo ajeno responde 404):
  - `GET /api/hallazgos/{id}`: detalle con rasgos privados e `imagenes: [{ id, posicion, mime }]`.
  - `GET /api/hallazgos/{id}/imagenes/{imagenId}`: foto por su UUID, en cualquier estado.
  - `GET /api/hallazgos/{id}/historial`: cambios de estado con fecha, usuario y motivo.
  - `PATCH /api/hallazgos/{id}`: JSON solo con los campos modificados. Responde 409 si el hallazgo ya no está Activo.
  - `PATCH /api/hallazgos/{id}/estado`: `{ "estado": "Devuelto" | "Retirado", "motivo": "opcional" }`.
- Las fotos públicas de la búsqueda usan la misma forma de URL con una posición del 1 al 5 (`/imagenes/1`). Con un UUID se sirve la foto privada del autor.
- Pruebas: `server/tests/gestion-hallazgos.test.js` y `server/tests/mis-hallazgos.test.js` (API), `client/src/MyFindingsPage.test.jsx` (pantalla), `server/tests/hallazgos-storage.postgres.test.js` y `server/tests/mis-hallazgos.postgres.test.js` (PostgreSQL real).

Recuperación de contraseña (SCRUM-43, API; SCRUM-94, pantallas React):

- Arrancar el buzón local con `docker compose up -d mail` y abrir `http://localhost:8025`. Solo captura correos de pruebas; no los entrega por Internet.
- Conservar el `.env` existente y añadir `SMTP_TEST_PORT=1025` y `RECOVERY_APP_ORIGIN=http://localhost:5173` (usar `http://localhost:3000` para el monolito compilado). Ejecutar `npm.cmd run db:migrate` para preparar las tablas sin borrar los datos.
- `POST /api/auth/forgot-password`, JSON `{ "email": "persona@example.com" }`: devuelve la misma confirmación para cuentas elegibles, inexistentes, inactivas y solicitudes limitadas por correo. El enlace aparece solo en el buzón de pruebas. Si SMTP falla se registra un error genérico y se conserva la misma confirmación; no se garantiza la entrega.
- `POST /api/auth/reset-password`, JSON `{ "token": "token-del-correo", "password": "Nueva1234", "confirmPassword": "Nueva1234" }`: cambia la contraseña, consume el enlace y elimina las sesiones de la cuenta en una sola transacción. No inicia sesión automáticamente.
- Desde el inicio de sesión, pulsar «He olvidado mi contraseña», solicitar el enlace y abrirlo en Mailpit. El enlace `/#restablecer-contrasena?token=...` abre el formulario de nueva contraseña. Tras completar el cambio se elimina el token de la URL y se vuelve al inicio de sesión, sin autenticar automáticamente.
- Al abrirlo se comprueba su vigencia con `POST /api/auth/validate-reset-token`, JSON `{ "token": "token-del-correo" }`. Si ha caducado, se ha sustituido o se ha usado, se muestra «Enlace expirado o no válido» sin mostrar el formulario. Esta consulta no consume el enlace; al guardar la contraseña se vuelve a validar dentro de la transacción.
- La prueba `server/tests/recovery.postgres.test.js` verifica el servidor con PostgreSQL y un buzón SMTP efímero, sin necesitar Docker ni enviar mensajes reales. Las pruebas de `client/src/RecoveryForms.test.jsx` verifican las pantallas y el contrato HTTP.
