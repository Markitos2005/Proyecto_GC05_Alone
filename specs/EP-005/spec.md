# EP-005 — Administración y asignación de facultades

## Épica

Como Administrador de Lost&Found UEx, quiero gestionar las cuentas, los roles, las facultades y la configuración común, para que los hallazgos, los avisos de pérdida y las solicitudes de recuperación funcionen con datos válidos y permisos controlados.

- **Objetivos relacionados:** G-05, G-06
- **Alcance relacionado:** S-06 — Administración
- **Indicador relacionado:** M-05 — Roles y alcance
- **Prioridad:** Must
- **Estimación:** 31 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002, EP-003, EP-004
- **Plan inicial:** IT-05

La administración diferencia exactamente los roles Usuario, Conserje y Administrador. Cada Conserje debe estar asignado a una facultad concreta y solo puede gestionar hallazgos y solicitudes asociados a ella. La administración no sustituye la validación ordinaria de solicitudes por parte del Conserje correspondiente.

## Historias de usuario

### US-023 — Gestionar facultades, centros y categorías

Como Administrador, quiero gestionar las facultades, los centros y las categorías disponibles, para que las publicaciones y solicitudes utilicen valores válidos y coherentes sin modificar el código.

- **Prioridad:** Must
- **Estimación:** 9 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-023-AC-01:** El Administrador puede consultar facultades, centros y categorías con su nombre, relación territorial cuando proceda y estado `Activo` o `Inactivo`.
- **US-023-AC-02:** El Administrador puede crear una facultad, un centro o una categoría con los campos obligatorios definidos.
- **US-023-AC-03:** El Administrador puede editar los datos permitidos de un elemento conservando su identificador y las publicaciones que lo referencian.
- **US-023-AC-04:** El Administrador puede desactivar y reactivar elementos de configuración sin borrar físicamente los datos históricos.
- **US-023-AC-05:** El sistema rechaza nombres duplicados, campos vacíos, longitudes excedidas y relaciones con facultades inexistentes.
- **US-023-AC-06:** Los formularios de hallazgos, avisos y solicitudes solo ofrecen facultades, centros y categorías activos.
- **US-023-AC-07:** No se puede desactivar una facultad que tenga Conserjes asignados sin resolver previamente sus asignaciones.
- **US-023-AC-08:** Usuarios y Conserjes no pueden crear, editar, desactivar ni reactivar estos elementos, ni desde la interfaz ni desde la API.

#### Verificación y restricciones

- Verificar la consulta, creación, edición, desactivación y reactivación de cada tipo de elemento.
- Verificar los errores por duplicados, campos inválidos, relaciones inexistentes y dependencias activas.
- Verificar que las publicaciones históricas conservan sus referencias aunque el elemento se desactive.
- Cumplir R-03, R-04, R-05, R-07, R-09 y A-03.

### US-024 — Gestionar cuentas y roles

Como Administrador, quiero consultar y administrar las cuentas y sus roles, para controlar el acceso a las funciones de Usuario, Conserje y Administrador.

- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002, US-003
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-024-AC-01:** El Administrador puede consultar un listado paginado de cuentas con correo, roles, estado y fecha de alta, aplicando los controles de privacidad definidos.
- **US-024-AC-02:** El Administrador puede buscar cuentas por correo y filtrarlas por rol y estado.
- **US-024-AC-03:** Una cuenta nueva tiene el rol `Usuario`; el Administrador puede conceder o revocar los roles `Conserje` y `Administrador` conforme a las reglas del sistema.
- **US-024-AC-04:** El Administrador puede activar o desactivar una cuenta sin eliminar físicamente sus publicaciones, solicitudes ni historial.
- **US-024-AC-05:** La desactivación invalida las sesiones activas y bloquea nuevos accesos de la cuenta.
- **US-024-AC-06:** El sistema impide desactivar o retirar el rol Administrador del último Administrador activo.
- **US-024-AC-07:** Un Administrador no puede desactivar su propia cuenta.
- **US-024-AC-08:** Los cambios de cuenta y roles se aplican antes de la siguiente operación autorizada del usuario afectado.
- **US-024-AC-09:** Usuarios y Conserjes no pueden consultar cuentas ni modificar roles o estados, ni desde la interfaz ni desde la API.

#### Verificación y restricciones

- Verificar la consulta, búsqueda, activación, desactivación, concesión y revocación de roles.
- Verificar la protección del último Administrador activo y el rechazo de la desactivación propia.
- Verificar que una cuenta desactivada no puede iniciar sesión y que conserva su información histórica.
- Cumplir R-03, R-05, R-07, R-09 y A-07.

### US-025 — Asignar Conserjes a facultades

Como Administrador, quiero asignar cada cuenta con rol Conserje a una facultad concreta, para limitar la gestión de hallazgos y solicitudes al ámbito que le corresponde.

- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-023, US-024
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-025-AC-01:** El Administrador puede conceder el rol `Conserje` a una cuenta activa seleccionando una facultad `Activa`, al cual este estará asignado.
- **US-025-AC-02:** El sistema no permite que una cuenta tenga el rol `Conserje` sin una facultad asignada.
- **US-025-AC-03:** El Administrador puede consultar la facultad asignada a cada Conserje y modificarla por otra facultad activa.
- **US-025-AC-04:** El Administrador puede revocar el rol `Conserje`; la cuenta conserva el rol `Usuario` y sus publicaciones e historial.
- **US-025-AC-05:** Un Conserje solo puede publicar, editar, retirar o marcar como Devuelto hallazgos de su facultad asignada.
- **US-025-AC-06:** Un Conserje solo puede consultar y decidir solicitudes de recuperación asociadas a su facultad.
- **US-025-AC-07:** Cambiar una asignación no modifica ni elimina los hallazgos, avisos o solicitudes históricos.
- **US-025-AC-08:** Usuarios y Conserjes no pueden crear, modificar ni revocar asignaciones.
- **US-025-AC-09:** El sistema informa de forma comprensible ante facultades inactivas, cuentas desactivadas u operaciones no autorizadas.

#### Verificación y restricciones

- Verificar la asignación, modificación y revocación del rol con facultades activas e inactivas.
- Verificar el aislamiento de hallazgos y solicitudes entre dos facultades.
- Verificar que el Conserje no obtiene permisos administrativos ni acceso a otra facultad.
- Cumplir R-03, R-05, R-07, R-08, R-09, R-11 y D-04.

### US-026 — Consultar la auditoría administrativa

Como Administrador, quiero consultar los cambios administrativos y de permisos, para revisar quién realizó cada operación y mantener la trazabilidad del sistema.

- **Prioridad:** Should
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-024, US-025
- **Plan inicial:** IT-06

#### Criterios de aceptación

- **US-026-AC-01:** El sistema registra como mínimo la creación, edición, activación, desactivación y modificación de roles, facultades, centros, categorías y asignaciones de Conserjes.
- **US-026-AC-02:** Cada registro incluye actor, fecha, operación, elemento afectado, estado anterior y posterior cuando proceda.
- **US-026-AC-03:** El Administrador puede consultar la auditoría con paginación y filtros por actor, tipo de operación, elemento y rango de fechas.
- **US-026-AC-04:** La auditoría es de solo lectura y no permite alterar ni borrar registros desde la aplicación.
- **US-026-AC-05:** Usuarios y Conserjes no pueden consultar la auditoría administrativa.
- **US-026-AC-06:** La consulta respeta la separación entre datos administrativos y la información privada de solicitudes o avisos.
- **US-026-AC-07:** Si no existen resultados, el sistema informa de forma comprensible sin presentar datos de otro ámbito.

#### Verificación y restricciones

- Verificar el registro de cambios de cuentas, roles, facultades, categorías y asignaciones.
- Verificar filtros, paginación, permisos de solo lectura y ausencia de resultados.
- Verificar que los registros permanecen disponibles después de desactivar una cuenta o elemento.
- Cumplir R-05, R-07, R-09, R-11 y D-04.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Mantener una herramienta centralizada, fiable y administrable para gestionar hallazgos, pérdidas y recuperaciones |
| Objetivos | G-05 — Acceso y administración controlados; G-06 — Producto revisable |
| Alcance | S-06 — Administración |
| Indicador | M-05 — Usuario, Conserje y Administrador solo ejecutan las operaciones permitidas para su rol y ámbito |
| Historias | US-023, US-024, US-025 y US-026 |
| Roles | Usuario, Conserje y Administrador |
| Configuración | Facultades, centros y categorías |
| Asignación territorial | Cada Conserje debe tener una facultad activa asignada |
| Estados | Elementos de configuración: `Activo / Inactivo`; cuenta: `Activa / Desactivada`; solicitud: `Pendiente / Validada/Rechazada` |
| Auditoría | Cambios administrativos y de permisos registrados y consultables en modo lectura |
| Restricciones | R-03, R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-04, D-07, D-09 y D-11 |
