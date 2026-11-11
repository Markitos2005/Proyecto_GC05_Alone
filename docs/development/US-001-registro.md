# US-001 · Implementación del registro (SCRUM-83)

Referencia: [diseño de Ángel, SCRUM-85](../technical-design/SCRUM-85-registro.md) y [criterios US-001](../../specs/EP-001/spec.md).

## Alcance y decisiones

Registro local completo: formulario React → API Express → PostgreSQL. Express sirve el frontend compilado, en un único proceso. En desarrollo Vite reenvía `/api` al backend; no se abre CORS.

Las tecnologías Express, React, PostgreSQL y Argon2id han sido confirmadas por Marcos como decisión del equipo. Se adopta el contrato `POST /api/auth/register` del diseño. No se implementan inicio de sesión, perfil, OAuth ni cambios en Jira en esta subtarea.

Se aplican estas decisiones técnicas de implementación:

- Correo: trim + minúsculas, máximo 254, validación de formato sin consulta DNS. Se admiten dominios distintos de UEx; formato no implica verificar titularidad. Se admiten direcciones con parte local ASCII y dominios internacionales compatibles con el validador.
- Contraseña: mínimo 8 caracteres, al menos una letra y un dígito decimal ASCII. Máximo 128 caracteres Unicode para limitar entradas desproporcionadas, conforme a la medida propuesta por Ángel. No se recorta ni normaliza.
- Argon2id: memoria 19 456 KiB, 2 iteraciones, paralelismo 1 y sal aleatoria de la biblioteca. El hash codificado incluye parámetros y sal; se verifica con `argon2.verify` en la futura US-002.
- Se conserva la unicidad del correo para cuentas desactivadas, siguiendo la propuesta inicial de Ángel. La eventual reutilización de esas direcciones sigue pendiente del PO/Tech Lead.
- `password_hash` admite NULL para no impedir la futura adaptación OAuth; el registro local siempre genera un hash. No se implementa OAuth aquí.
- Límite: 20 peticiones por IP cada 15 minutos; HTTP 429 al superarlo. El contador es local al proceso, válido para este monolito de una instancia; no configura un despliegue distribuido. No se confían cabeceras de proxy automáticamente. HTTPS debe terminarse en la infraestructura del despliegue; el servidor local usa HTTP.

## Estructura y recorrido del código

| Ruta | Responsabilidad |
| --- | --- |
| `client/src/RegistrationForm.jsx` | Formulario accesible, estados de envío, mensajes y limpieza de contraseña |
| `server/src/app.js` | Ruta, límites HTTP, archivos estáticos y errores públicos |
| `server/src/controllers/register.js` | Respuesta HTTP 201 |
| `server/src/services/register.js` | Validación, duplicados, hash y creación |
| `server/src/validation/registration.js` | Validación autoritativa del servidor |
| `server/src/security/passwords.js` | Hash Argon2id |
| `server/src/repositories/users.js` | Consultas SQL parametrizadas |
| `server/db/migrations/001-usuarios.sql` | Tabla, valores iniciales, normalización y unicidad |
| `server/src/index.js` | Conexión y arranque del monolito |

El servicio consulta el correo antes de calcular el hash. La restricción UNIQUE evita duplicados aunque dos peticiones superen esa consulta simultáneamente. Rol y estado se establecen en servidor; cualquier valor aportado por el cliente se ignora. Ni las respuestas ni los logs de la aplicación contienen contraseñas, hashes, cuerpos de peticiones ni credenciales de BD.

## Arranque en Windows / VS Code

Requisitos: Node.js 22.12 o posterior compatible y PostgreSQL (local o Docker Desktop con motor activo). En PowerShell usar `npm.cmd` evita depender de la política de scripts de Windows.

1. Desde la raíz: `npm.cmd ci`.
2. Copiar `.env.example` a `.env`: `Copy-Item .env.example .env` (solo si todavía no tienes `.env`). Ajustar las URLs si se usa PostgreSQL ya instalado. `.env` está excluido de Git.
3. Con Docker: `docker compose up -d --wait db`. Crea `lost_found` y, al inicializar un volumen nuevo, `lost_found_test`. Si se usa instalación local, crear ambas bases con un usuario con permisos sobre ellas y configurar las URLs. Nunca usar datos reales.
4. Preparar tabla: `npm.cmd run db:migrate`.
5. Desarrollo: `npm.cmd run dev`. Abrir la dirección que indique Vite, normalmente `http://localhost:5173`.
6. Monolito compilado: detener desarrollo, ejecutar `npm.cmd run build` y `npm.cmd start`. Abrir `http://localhost:3000`.

La migración inicial puede repetirse y no borra datos. No es un mecanismo para modificar una tabla antigua con otro esquema. El volumen de Docker conserva las cuentas entre arranques; `docker compose stop` detiene la BD sin borrarla.

## Contrato API

Petición `POST /api/auth/register`, `Content-Type: application/json`:

```json
{"email":"persona@example.com","password":"Prueba1234"}
```

HTTP 201:

```json
{"message":"Usuario registrado correctamente","user":{"id":"UUID generado","email":"persona@example.com","rol":"USUARIO"}}
```

Errores: 400 validación o JSON incorrecto; 409 correo no disponible; 413 cuerpo superior a 16 KiB; 415 formato no JSON; 429 exceso de intentos; 500 fallo interno con mensaje genérico. La validación devuelve `errors.email` o `errors.password` para asociar el mensaje al campo. No se crea sesión tras registrar: eso pertenece a US-002.

## Pruebas preparadas para Raúl (SCRUM-84)

Estas pruebas apoyan su validación; no marcan su subtarea como completada.

```powershell
npm.cmd test
npm.cmd run test:db
npm.cmd run build
npm.cmd run test:monolith
```

- `npm.cmd test`: API HTTP con repositorio en memoria y Argon2 real, más componentes React con DOM simulado. No prueba PostgreSQL ni sustituye la revisión visual en navegador.
- `npm.cmd run test:db`: API y repositorio contra PostgreSQL real. Exige `TEST_DATABASE_URL` explícita y distinta de `DATABASE_URL`. Crea un esquema temporal aleatorio, aplica la migración, prueba persistencia/hash/unicidad/concurrencia y elimina exclusivamente ese esquema. No trunca las tablas del proyecto. Si falta la conexión falla, no se omite silenciosamente.
- `npm.cmd run build`: compila React para que lo sirva Express.
- `npm.cmd run test:monolith`: compila y arranca el proceso real en puerto efímero, comprueba HTML, bundle React y registro HTTP contra PostgreSQL en otro esquema temporal. Exige la misma base independiente de pruebas. No automatiza un navegador ni reemplaza la revisión visual.

### Lista manual con datos ficticios

| Caso | Acción | Resultado esperado |
| --- | --- | --- |
| Registro válido (AC-01/05) | Correo nuevo de cualquier dominio y `Prueba1234` | Confirmación, una fila, rol USUARIO, activo TRUE |
| Normalización/duplicado (AC-03) | Repetir correo variando mayúsculas/espacios mediante API | 409, no aparece segunda fila |
| Vacíos (AC-02) | Enviar sin datos y repetir por API | Formulario impide envío; API 400 |
| Correo inválido (AC-02) | `sin-correo` | Formulario impide envío; API 400 |
| Contraseña insuficiente (AC-02) | `Abc123`, `abcdefgh`, `12345678` | Rechazo tanto en cliente como en servidor |
| Límite válido | `Abcdefg1` | Registro permitido con correo nuevo |
| Seguridad (AC-04/06) | Revisar fila y respuesta/red del registro | BD contiene `$argon2id$…`; respuesta sin password/hash; nunca publicar el hash en evidencias |
| Fallo de BD (AC-06) | Detener BD e intentar registrar | Mensaje genérico; sin trazas/credenciales en respuesta |
| Doble envío | Pulsar repetidamente mientras envía | Botón desactivado, una solicitud desde formulario |
| Límite de intentos | Más de 20 solicitudes en 15 min | 429 con Retry-After; esperar la ventana para continuar |
| Accesibilidad | Recorrer con Tab, enviar y revisar mensajes | Etiquetas asociadas, foco visible, estado anunciado, foco en resultado |
| Pantalla pequeña | Abrir a 360 px de ancho | Sin desbordamiento horizontal |

Consulta de comprobación sin mostrar hashes:

```sql
SELECT id, email, rol, activo, created_at,
       password_hash LIKE '$argon2id$%' AS usa_argon2id
FROM usuarios WHERE email = 'persona@example.com';
```

Registrar fecha, versión/commit probado, caso, esperado, obtenido y evidencia sin secretos. La aceptación por Raúl y la revisión del equipo siguen pendientes; no confundir pruebas automáticas verdes con el cierre de la historia.
