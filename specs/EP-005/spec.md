# EP-005 — Administración

## Épica

Como Administrador de Lost&Found UEx, quiero mantener la configuración común de los feeds y del contacto por correo, para que la aplicación utilice categorías, ubicaciones y puntos de entrega válidos sin modificar el código.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-06 — Gestión administrativa
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002, EP-003, EP-004
- **Plan inicial:** Release 2, Iteración 7

## Historias de usuario

### US-016 — Administración de publicaciones

Como Administrador, quiero gestionar las categorías, ubicaciones y puntos de entrega utilizados por la aplicación, para mantener coherentes los feeds de hallazgos y solicitudes sin tocar el código.

- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-004, US-005, US-009, US-013
- **Plan inicial:** Release 2, Iteración 7

#### Criterios de aceptación

- **US-016-AC-01:** El Administrador puede consultar, crear, editar y desactivar las categorías disponibles para clasificar hallazgos y solicitudes.
- **US-016-AC-02:** El Administrador puede consultar, crear, editar y desactivar las ubicaciones utilizadas por los feeds.
- **US-016-AC-03:** El Administrador puede consultar, crear, editar y desactivar los puntos de entrega utilizados para los hallazgos.
- **US-016-AC-04:** El sistema valida los datos de configuración antes de guardarlos y rechaza valores duplicados, incompletos o inválidos.
- **US-016-AC-05:** El sistema no permite desactivar una categoría, ubicación o punto de entrega si existen publicaciones activas que dependan de ella, salvo que se seleccione una sustitución válida.
- **US-016-AC-06:** Un Usuario no puede modificar la configuración administrativa, ni desde la interfaz ni desde la API.
- **US-016-AC-07:** Los cambios de configuración quedan asociados al Administrador que los realizó, a la fecha de la operación y al tipo de cambio.
- **US-016-AC-08:** La desactivación de una categoría, ubicación o punto de entrega no modifica retroactivamente las publicaciones existentes.
- **US-016-AC-09:** El sistema muestra mensajes comprensibles ante errores, conflictos de integridad o acciones no permitidas.

#### Verificación y restricciones

- Verificar el acceso permitido para Administradores y el acceso denegado para Usuarios en la interfaz y en la API.
- Verificar la creación, edición, consulta y desactivación de categorías, ubicaciones y puntos de entrega con datos ficticios o sintéticos.
- Verificar que los feeds solo permiten seleccionar valores de configuración activos.
- Verificar que una configuración utilizada por publicaciones activas no puede desactivarse sin resolver antes sus dependencias.
- Verificar que los cambios no alteran los datos históricos de hallazgos, solicitudes ni contactos.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09, A-04 y A-07.

### US-017 — Administración de usuarios

Como Administrador, quiero gestionar usuarios y su rol dentro de la aplicación, para controlar quién puede acceder a funciones administrativas.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-004, US-016
- **Plan inicial:** Release 3, Iteración 8

#### Criterios de aceptación

- **US-017-AC-01:** El Administrador puede consultar el listado de usuarios registrados, incluyendo su estado y rol actual.
- **US-017-AC-02:** El Administrador puede promover un usuario a rol Administrador y revocar ese rol.
- **US-017-AC-03:** El sistema no permite que un Administrador elimine físicamente usuarios; como alternativa puede desactivar cuentas.
- **US-017-AC-04:** El sistema impide desactivar la última cuenta con rol Administrador.
- **US-017-AC-05:** Un usuario sin rol Administrador no puede gestionar cuentas ni roles desde la interfaz ni desde la API.
- **US-017-AC-06:** Todo cambio de rol o estado de cuenta queda registrado con fecha, usuario administrador y acción realizada.
- **US-017-AC-07:** La desactivación de una cuenta no elimina publicaciones históricas ni contactos ya registrados.

#### Verificación y restricciones

- Verificar promoción y revocación de rol Administrador entre varias cuentas de prueba.
- Verificar que no se puede desactivar la última cuenta administradora activa.
- Verificar que una cuenta desactivada no puede iniciar sesión ni operar en la aplicación.
- Verificar que usuarios no administradores reciben acceso denegado al intentar operar sobre cuentas.
- Cumplir R-03, R-05, R-07, R-08, R-09 y A-07.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Mantener una herramienta centralizada, fiable y mantenible para gestionar objetos perdidos y encontrados |
| Objetivo | G-04 — Acceso controlado |
| Alcance | S-06 — Gestión administrativa |
| Indicador | M-05 — El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado |
| Roles implicados | Administrador y Usuario |
| Configuración | Categorías, ubicaciones, puntos de entrega y estado de cuentas |
| Restricciones | R-03, R-04, R-05, R-07, R-08 y R-09 |
| Decisiones | D-04, D-06 y D-08 |
