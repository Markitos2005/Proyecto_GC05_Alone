# EP-005 — Administración

## Épica

Como Administrador de Lost&Found UEx, quiero mantener la configuración común de los feeds y del contacto por correo, para que la aplicación utilice categorías, ubicaciones y puntos de entrega válidos sin modificar el código.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-06 — Gestión administrativa
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 24 h-p (aprox. 3 semanas-persona a 8 h-p por semana)
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002, EP-003, EP-004
- **Plan inicial:** IT-05

## Historias de usuario

### US-017 — Administración de publicaciones

Como Administrador, quiero gestionar las categorías, ubicaciones y puntos de entrega utilizados por la aplicación, para mantener coherentes los feeds de hallazgos y solicitudes sin tocar el código.

- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-005, US-006, US-010, US-014
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-017-AC-01:** El Administrador puede consultar, crear, editar y desactivar las categorías disponibles para clasificar hallazgos y solicitudes.
- **US-017-AC-02:** El Administrador puede consultar, crear, editar y desactivar las ubicaciones utilizadas por los feeds.
- **US-017-AC-03:** El Administrador puede consultar, crear, editar y desactivar los puntos de entrega utilizados para los hallazgos.
- **US-017-AC-04:** El sistema valida los datos de configuración antes de guardarlos y rechaza valores duplicados, incompletos o inválidos.
- **US-017-AC-05:** El sistema no permite desactivar una categoría, ubicación o punto de entrega si existen publicaciones activas que dependan de ella, salvo que se seleccione una sustitución válida.
- **US-017-AC-06:** Un Usuario no puede modificar la configuración administrativa, ni desde la interfaz ni desde la API.
- **US-017-AC-07:** Los cambios de configuración quedan asociados al Administrador que los realizó, a la fecha de la operación y al tipo de cambio.
- **US-017-AC-08:** La desactivación de una categoría, ubicación o punto de entrega no modifica retroactivamente las publicaciones existentes.
- **US-017-AC-09:** El sistema muestra mensajes comprensibles ante errores, conflictos de integridad o acciones no permitidas.

#### Verificación y restricciones

- Verificar el acceso permitido para Administradores y el acceso denegado para Usuarios en la interfaz y en la API.
- Verificar la creación, edición, consulta y desactivación de categorías, ubicaciones y puntos de entrega con datos ficticios o sintéticos.
- Verificar que los feeds solo permiten seleccionar valores de configuración activos.
- Verificar que una configuración utilizada por publicaciones activas no puede desactivarse sin resolver antes sus dependencias.
- Verificar que los cambios no alteran los datos históricos de hallazgos, solicitudes ni contactos.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09, A-04 y A-07.

### US-018 — Administración de usuarios

Como Administrador, quiero gestionar usuarios y su rol dentro de la aplicación, para controlar quién puede acceder a funciones administrativas.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-005, US-017
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-018-AC-01:** El Administrador puede consultar el listado de usuarios registrados, incluyendo su estado y rol actual.
- **US-018-AC-02:** El Administrador puede promover un usuario a rol Administrador y revocar ese rol.
- **US-018-AC-03:** El sistema no permite que un Administrador elimine físicamente usuarios; como alternativa puede desactivar cuentas.
- **US-018-AC-04:** El sistema impide desactivar la última cuenta con rol Administrador.
- **US-018-AC-05:** Un usuario sin rol Administrador no puede gestionar cuentas ni roles desde la interfaz ni desde la API.
- **US-018-AC-06:** Todo cambio de rol o estado de cuenta queda registrado con fecha, usuario administrador y acción realizada.
- **US-018-AC-07:** La desactivación de una cuenta no elimina publicaciones históricas ni contactos ya registrados.

#### Verificación y restricciones

- Verificar promoción y revocación de rol Administrador entre varias cuentas de prueba.
- Verificar que no se puede desactivar la última cuenta administradora activa.
- Verificar que una cuenta desactivada no puede iniciar sesión ni operar en la aplicación.
- Verificar que usuarios no administradores reciben acceso denegado al intentar operar sobre cuentas.
- Cumplir R-03, R-05, R-07, R-08, R-09 y A-07.

### US-028 — Consultar la auditoría administrativa

Como Administrador, quiero consultar los cambios realizados sobre la configuración y las cuentas, para supervisar la actividad administrativa y detectar operaciones inesperadas.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-017, US-018
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-028-AC-01:** El Administrador puede consultar eventos de cambios sobre categorías, ubicaciones, puntos de entrega, usuarios y roles.
- **US-028-AC-02:** Cada evento muestra la fecha, el Administrador, el tipo de operación y el elemento afectado.
- **US-028-AC-03:** El Administrador puede filtrar los eventos por tipo, fecha y elemento afectado.
- **US-028-AC-04:** Los eventos no pueden modificarse ni eliminarse desde la interfaz administrativa.
- **US-028-AC-05:** Un Usuario no puede consultar la auditoría administrativa.

#### Verificación y restricciones

- Verificar la generación y consulta de eventos después de cambios de configuración y cuentas.
- Verificar filtros, integridad de los eventos y acceso denegado a usuarios no administradores.
- Cumplir R-05, R-07, R-08, R-09 y A-07.

### US-029 — Administrar la configuración del contacto por correo

Como Administrador, quiero configurar los parámetros comunes del contacto por correo, para mantener mensajes coherentes sin modificar el código de la aplicación.

- **Prioridad:** Should
- **Estimación:** 7 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-005, US-017
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-029-AC-01:** El Administrador puede consultar y editar el asunto y las instrucciones comunes de los mensajes `mailto:`.
- **US-029-AC-02:** El sistema valida la longitud, los campos permitidos y el contenido obligatorio.
- **US-029-AC-03:** Los cambios se aplican a nuevos contactos sin alterar los mensajes históricos.
- **US-029-AC-04:** Un Usuario no puede modificar esta configuración desde la interfaz ni desde la API.
- **US-029-AC-05:** Los cambios quedan registrados en la auditoría con fecha, Administrador y valores aplicados.
- **US-029-AC-06:** La configuración no permite introducir destinatarios arbitrarios que eviten las reglas de contacto.

#### Verificación y restricciones

- Verificar configuración válida, valores inválidos, aplicación a un nuevo `mailto:` y acceso denegado.
- Verificar que los cambios no modifican contactos ya iniciados ni exponen información privada.
- Cumplir R-04, R-05, R-07, R-08, R-09 y D-05.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Mantener una herramienta centralizada, fiable y mantenible para gestionar objetos perdidos y encontrados |
| Objetivo | G-04 — Acceso controlado |
| Alcance | S-06 — Gestión administrativa |
| Indicador | M-05 — El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado |
| Roles implicados | Administrador y Usuario |
| Configuración | Categorías, ubicaciones, puntos de entrega y estado de cuentas |
| Historias | US-017, US-018, US-028 y US-029 |
| Restricciones | R-03, R-04, R-05, R-07, R-08 y R-09 |
| Decisiones | D-04, D-06 y D-08 |
