# EP-005 — Administración

## Épica

Como Administrador de Lost&Found UEx, quiero gestionar la configuración común de la aplicación, las cuentas y los roles de los usuarios, para que los feeds utilicen categorías, ubicaciones y puntos de entrega válidos y solo las personas autorizadas accedan a las funciones administrativas y de conserjería sin modificar el código.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-06 — Gestión administrativa
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 34 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002, EP-003, EP-004
- **Plan inicial:** IT-05

## Historias de usuario

### US-017 — Gestionar la configuración de los feeds

Como Administrador, quiero consultar, crear, editar, desactivar y reactivar las categorías, ubicaciones y puntos de entrega, para que los hallazgos y las solicitudes de búsqueda se clasifiquen con valores coherentes sin modificar el código.

- **Prioridad:** Must
- **Estimación:** 11 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-002, US-006, US-010
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-017-AC-01:** El Administrador puede consultar el listado de categorías, ubicaciones y puntos de entrega, con su nombre y estado Activo o Inactivo.
- **US-017-AC-02:** El Administrador puede crear una categoría indicando su nombre y, opcionalmente, una descripción.
- **US-017-AC-03:** El Administrador puede crear una ubicación indicando su nombre y, opcionalmente, unas coordenadas geográficas de referencia.
- **US-017-AC-04:** El Administrador puede crear un punto de entrega indicando su nombre, la ubicación activa a la que pertenece y las indicaciones públicas para la recogida.
- **US-017-AC-05:** El Administrador puede editar los datos de un elemento existente; la edición conserva su identificador y las publicaciones que lo referencian siguen asociadas a él.
- **US-017-AC-06:** El sistema valida los datos antes de guardarlos y rechaza campos obligatorios vacíos, longitudes fuera de los límites, coordenadas inválidas y nombres duplicados dentro del mismo tipo sin distinguir entre mayúsculas y minúsculas.
- **US-017-AC-07:** El Administrador puede desactivar un elemento Activo; un elemento Inactivo deja de ofrecerse al publicar hallazgos y solicitudes y al filtrar los feeds, pero no se elimina físicamente.
- **US-017-AC-08:** El sistema no permite desactivar un elemento del que dependan publicaciones activas, puntos de entrega activos o conserjes asignados, salvo que el Administrador seleccione un sustituto Activo del mismo tipo.
- **US-017-AC-09:** La sustitución solo se aplica a las publicaciones activas; los hallazgos Devueltos o Retirados y las solicitudes Cerradas conservan el valor que tenían.
- **US-017-AC-10:** El Administrador puede reactivar un elemento Inactivo, que vuelve a estar disponible para nuevas publicaciones y filtros.
- **US-017-AC-11:** Un usuario sin rol Administrador no puede crear, editar, desactivar ni reactivar elementos de configuración, ni desde la interfaz ni desde la API.
- **US-017-AC-12:** Cada cambio queda registrado con la fecha, el Administrador, el tipo de operación, el elemento afectado y los valores anterior y nuevo.
- **US-017-AC-13:** El sistema informa de forma comprensible ante datos inválidos, conflictos de dependencias u operaciones no autorizadas.

#### Verificación y restricciones

- Verificar la consulta, creación, edición, desactivación y reactivación de cada tipo de elemento.
- Verificar el rechazo de nombres duplicados, campos vacíos, longitudes excedidas, coordenadas inválidas y puntos de entrega asociados a una ubicación inactiva.
- Verificar que los formularios de US-006 y US-010 y los filtros de US-008 y US-019 solo ofrecen valores activos.
- Verificar que no se puede desactivar un elemento con dependencias sin sustituto y que la sustitución no altera las publicaciones finalizadas.
- Verificar el acceso denegado a Usuarios y Conserjes en la interfaz y en la API.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09, A-04 y A-07.

### US-018 — Gestionar cuentas y el rol Administrador

Como Administrador, quiero consultar las cuentas registradas, activarlas o desactivarlas y conceder o revocar el rol Administrador, para controlar quién puede usar la aplicación y quién accede a sus funciones administrativas.

- **Prioridad:** Should
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002, US-003
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-018-AC-01:** El Administrador puede consultar un listado paginado de cuentas con su correo, roles, estado y fecha de alta.
- **US-018-AC-02:** El Administrador puede buscar cuentas por correo y filtrarlas por rol y estado.
- **US-018-AC-03:** El Administrador puede conceder el rol Administrador a una cuenta activa y revocárselo.
- **US-018-AC-04:** El Administrador puede desactivar una cuenta activa y reactivar una cuenta desactivada; el sistema no permite eliminar cuentas físicamente.
- **US-018-AC-05:** La desactivación invalida las sesiones activas de la cuenta, y la revocación del rol Administrador se aplica a la siguiente operación que intente realizar.
- **US-018-AC-06:** El sistema impide revocar el rol o desactivar la cuenta del último Administrador activo.
- **US-018-AC-07:** Un Administrador no puede desactivar su propia cuenta.
- **US-018-AC-08:** La desactivación de una cuenta no elimina sus publicaciones, su historial ni los contactos ya registrados.
- **US-018-AC-09:** Un usuario sin rol Administrador no puede consultar cuentas ni modificar roles o estados, ni desde la interfaz ni desde la API.
- **US-018-AC-10:** Cada cambio de rol o de estado queda registrado con la fecha, el Administrador, la cuenta afectada y la acción realizada.
- **US-018-AC-11:** El sistema informa de forma comprensible ante operaciones no permitidas o no autorizadas.

#### Verificación y restricciones

- Verificar la concesión y revocación del rol Administrador entre varias cuentas de prueba.
- Verificar que una cuenta desactivada no puede iniciar sesión y que sus sesiones abiertas dejan de ser válidas.
- Verificar el rechazo al revocar o desactivar al último Administrador activo y al desactivar la propia cuenta.
- Verificar que las publicaciones e historial de una cuenta desactivada se conservan.
- Verificar el acceso denegado a Usuarios y Conserjes en la interfaz y en la API.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-05, R-07, R-08, R-09 y A-07.

### US-030 — Asignar el rol Conserje

Como Administrador, quiero conceder y revocar el rol Conserje a usuarios registrados, asociándolos a uno o varios puntos de entrega, para que el personal de conserjería pueda gestionar los objetos depositados en su punto sin obtener permisos administrativos.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-017, US-018
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-030-AC-01:** El Administrador puede conceder el rol Conserje a una cuenta activa seleccionando al menos un punto de entrega Activo.
- **US-030-AC-02:** El Administrador puede consultar los conserjes registrados y los puntos de entrega asignados a cada uno.
- **US-030-AC-03:** El Administrador puede añadir o quitar puntos de entrega a un Conserje, que debe conservar al menos uno mientras mantenga el rol.
- **US-030-AC-04:** El Administrador puede revocar el rol Conserje; la cuenta conserva el rol Usuario y sus publicaciones.
- **US-030-AC-05:** El rol Conserje no concede permisos administrativos y sus permisos se limitan a los puntos de entrega asignados.
- **US-030-AC-06:** La concesión, modificación o revocación del rol se aplica a la siguiente operación que realice el usuario afectado.
- **US-030-AC-07:** Un usuario sin rol Administrador no puede conceder, modificar ni revocar el rol Conserje, ni desde la interfaz ni desde la API.
- **US-030-AC-08:** Cada cambio queda registrado con la fecha, el Administrador, la cuenta afectada, la acción y los puntos de entrega implicados.
- **US-030-AC-09:** El sistema informa de forma comprensible ante cuentas desactivadas, puntos de entrega inactivos u operaciones no autorizadas.

#### Verificación y restricciones

- Verificar la concesión del rol con uno y con varios puntos de entrega, su modificación y su revocación.
- Verificar el rechazo al asignar un punto de entrega inactivo, al dejar a un Conserje sin puntos y al conceder el rol a una cuenta desactivada.
- Verificar que un Conserje recibe acceso denegado en las funciones administrativas y en puntos de entrega no asignados.
- Verificar el acceso denegado a Usuarios y Conserjes al intentar gestionar el rol en la interfaz y en la API.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-05, R-07, R-08, R-09 y A-07.

### US-028 — Consultar la auditoría administrativa

Como Administrador, quiero consultar los cambios realizados sobre la configuración, las cuentas y los roles, para supervisar la actividad administrativa y detectar operaciones inesperadas.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-017, US-018, US-030
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-028-AC-01:** El Administrador puede consultar los eventos de cambios sobre categorías, ubicaciones, puntos de entrega, cuentas, roles y configuración del contacto por correo.
- **US-028-AC-02:** Cada evento muestra la fecha, el Administrador, el tipo de operación y el elemento afectado.
- **US-028-AC-03:** El Administrador puede filtrar los eventos por tipo, fecha y elemento afectado.
- **US-028-AC-04:** Los eventos no pueden modificarse ni eliminarse desde la interfaz ni desde la API.
- **US-028-AC-05:** Un usuario sin rol Administrador no puede consultar la auditoría administrativa.

#### Verificación y restricciones

- Verificar la generación y consulta de eventos después de cambios de configuración, cuentas y roles.
- Verificar los filtros, la integridad de los eventos y el acceso denegado a Usuarios y Conserjes.
- Cumplir R-05, R-07, R-08, R-09 y A-07.

### US-029 — Administrar la configuración del contacto por correo

Como Administrador, quiero configurar los parámetros comunes del contacto por correo, para mantener mensajes coherentes sin modificar el código de la aplicación.

- **Prioridad:** Should
- **Estimación:** 7 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-014, US-017
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-029-AC-01:** El Administrador puede consultar y editar el asunto y las instrucciones comunes de los mensajes `mailto:`.
- **US-029-AC-02:** El sistema valida la longitud, los campos permitidos y el contenido obligatorio.
- **US-029-AC-03:** Los cambios se aplican a nuevos contactos sin alterar los mensajes históricos.
- **US-029-AC-04:** Un usuario sin rol Administrador no puede modificar esta configuración desde la interfaz ni desde la API.
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
| Historias | US-017, US-018, US-030, US-028 y US-029 |
| Roles | Administrador, Conserje y Usuario |
| Configuración | Categorías, ubicaciones, puntos de entrega y contacto por correo |
| Estados | Elemento de configuración: Activo ↔ Inactivo; cuenta: Activa ↔ Desactivada |
| Restricciones | R-03, R-04, R-05, R-07, R-08 y R-09 |
| Decisiones | D-04, D-06 y D-08 |
