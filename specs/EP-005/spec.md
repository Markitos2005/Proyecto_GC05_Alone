# EP-005 — Administración

## Épica

Como Administrador de Lost&Found UEx, quiero gestionar la configuración básica y los roles de la aplicación, para mantener actualizada la información utilizada por el sistema sin modificar el código.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-06 — Gestión administrativa
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002
- **Plan inicial:** Release 2, Iteración 6

## Historias de usuario

### US-020 — Gestionar la configuración y los roles

Como Administrador, quiero gestionar las categorías, ubicaciones, puntos de entrega y asignaciones del rol Responsable, para mantener la configuración de la aplicación y adaptar los permisos de gestión a las necesidades del servicio.

- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-004, US-006
- **Plan inicial:** Release 2, Iteración 6

#### Criterios de aceptación

- **US-020-AC-01:** El Administrador puede consultar, crear, editar y desactivar las categorías disponibles para clasificar objetos.
- **US-020-AC-02:** El Administrador puede consultar, crear, editar y desactivar las ubicaciones utilizadas por el sistema.
- **US-020-AC-03:** El Administrador puede consultar, crear, editar y desactivar los puntos de entrega utilizados para depositar objetos encontrados.
- **US-020-AC-04:** El sistema no permite desactivar una categoría, ubicación o punto de entrega si existen registros activos que dependan de él, salvo que se aplique una sustitución válida definida por el sistema.
- **US-020-AC-05:** El Administrador puede asignar el rol Responsable a un usuario existente.
- **US-020-AC-06:** El Administrador puede retirar el rol Responsable a un usuario, manteniendo su cuenta con el rol Usuario.
- **US-020-AC-07:** Un usuario sin rol Administrador no puede modificar categorías, ubicaciones, puntos de entrega ni roles, tanto desde la interfaz como desde la API.
- **US-020-AC-08:** El sistema valida los datos antes de guardar cambios y muestra mensajes comprensibles ante errores o acciones no permitidas.
- **US-020-AC-09:** Los cambios de configuración y de roles quedan asociados al Administrador que los realizó y a la fecha de la operación.

#### Verificación y restricciones

- Verificar el acceso permitido y denegado para Administradores, Responsables y Usuarios en la interfaz y en la API.
- Verificar la creación, edición, desactivación y consulta de categorías, ubicaciones y puntos de entrega mediante datos ficticios o sintéticos.
- Verificar que las categorías, ubicaciones y puntos de entrega utilizados por los objetos existentes conservan la integridad de sus referencias.
- Verificar que la asignación y retirada del rol Responsable se aplica a las operaciones protegidas en el siguiente acceso o actualización de permisos.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09, A-04 y A-07.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Proporcionar una herramienta centralizada, fiable y mantenible para gestionar objetos perdidos y encontrados |
| Objetivo | G-04 — Acceso controlado |
| Alcance | S-06 — Gestión administrativa |
| Indicador | M-05 — El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado |
| Roles implicados | Administrador, Responsable y Usuario |
| Restricciones | R-03, R-04, R-05, R-07, R-08 y R-09 |
| Decisiones | D-04 |

