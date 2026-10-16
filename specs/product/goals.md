# Lost&Found UEx — Objetivos, alcance y trazabilidad

## 1. Objetivos

Los objetivos concretan los resultados que Lost&Found UEx debe alcanzar durante el desarrollo. El sistema distingue entre la gestión de objetos encontrados por el personal de conserjería y la comunicación de pérdidas por parte de los usuarios.

| ID | Objetivo | Resultado esperado |
| --- | --- | --- |
| G-01 | Gestión de objetos encontrados | Los Conserjes pueden registrar y gestionar objetos encontrados en la facultad que tienen asignada. |
| G-02 | Búsqueda de objetos perdidos | Los Usuarios pueden describir un objeto perdido y consultar hallazgos coincidentes en la facultad o centro indicado. |
| G-03 | Recuperación validada | Los Usuarios pueden solicitar la recuperación aportando información que permita demostrar la propiedad y los Conserjes pueden validar o rechazar la solicitud. |
| G-04 | Avisos de pérdidas | Los Usuarios pueden publicar avisos de objetos perdidos con información de contacto, sin que estos avisos formen parte del flujo de hallazgos gestionado por Conserjería. |
| G-05 | Acceso y administración controlados | El sistema diferencia los roles Usuario, Conserje y Administrador, y limita sus operaciones según la facultad y los permisos asignados. |
| G-06 | Producto revisable | Una persona que no haya participado en el desarrollo puede instalar, ejecutar y evaluar el producto siguiendo la documentación proporcionada. |

## 2. Indicadores de éxito

Los indicadores se mantienen sencillos y se verifican mediante pruebas funcionales y una revisión final.

| ID | Objetivo | Indicador | Meta |
| --- | --- | --- | --- |
| M-01 | G-01 | Publicación de hallazgos | Un Conserje puede registrar y gestionar un objeto encontrado asociado a su facultad. |
| M-02 | G-02 | Búsqueda por facultad o centro | Un Usuario puede describir una pérdida y consultar los hallazgos coincidentes del centro indicado. |
| M-03 | G-03 | Solicitud de recuperación | Una solicitud válida queda Pendiente, puede ser revisada por el Conserje correspondiente y genera un aviso tras su validación. |
| M-04 | G-04 | Feed de pérdidas | Un Usuario puede publicar y consultar avisos de pérdidas sin mezclarlos con los hallazgos de Conserjería. |
| M-05 | G-05 | Roles y alcance | Usuario, Conserje y Administrador solo pueden ejecutar las operaciones permitidas para su rol y ámbito. |
| M-06 | G-06 | Producto ejecutable | Una persona externa puede instalar y ejecutar el producto siguiendo la documentación. |
| M-07 | Todos | Revisión final | No hay defectos bloqueantes abiertos al finalizar la revisión. |

## 3. Stakeholders

| ID | Stakeholder | Interés | Influencia | Estrategia |
| --- | --- | --- | --- | --- |
| SH-01 | Estudiantes y personal UEx (Usuario) | Comunicar pérdidas y recuperar objetos de forma segura | Media | Validar los flujos de búsqueda, solicitud y avisos de pérdida |
| SH-02 | Personal de conserjería (Conserje) | Registrar hallazgos y validar solicitudes de recuperación | Alta | Validar los flujos de gestión por facultad |
| SH-03 | Administrador de la aplicación | Mantener usuarios, roles y configuración común | Alta | Mantener informado y validar las operaciones administrativas |
| SH-04 | Profesorado de GPS | Trazabilidad, alcance y calidad del producto | Muy alta | Revisar hitos, entregas y evidencias |
| SH-05 | Equipo de desarrollo | Alcance estable y requisitos verificables | Alta | Refinar el backlog y mantener la coherencia de las specs |
| SH-06 | Protección de datos UEx | Uso controlado de datos personales | Media | Utilizar datos ficticios o sintéticos durante desarrollo y demostración |

## 4. Roles y permisos

El sistema tendrá exactamente tres roles:

| Rol | Ámbito | Permisos principales |
| --- | --- | --- |
| Usuario | Cuenta propia | Buscar hallazgos, solicitar recuperaciones, publicar avisos de pérdidas y consultar su historial |
| Conserje | Una facultad asignada | Publicar y gestionar hallazgos de su facultad, revisar solicitudes de recuperación asociadas y emitir avisos de validación |
| Administrador | Sistema completo | Gestionar cuentas, roles, facultades, centros, categorías, asignaciones de Conserjes y auditoría |

Reglas generales:

- Una cuenta nueva recibe el rol Usuario.
- Un Administrador asigna cada Conserje a una facultad concreta.
- Un Conserje solo puede crear, editar, retirar o validar información vinculada a su facultad asignada.
- Un Usuario no puede publicar objetos encontrados ni validar solicitudes de recuperación.
- Un Administrador no sustituye al Conserje en la validación ordinaria de solicitudes, salvo que se defina expresamente una operación de soporte.

## 5. Alcance incluido

### S-01 — Gestión de cuenta y autenticación

- Registro de cuentas mediante correo electrónico y contraseña.
- Inicio y cierre de sesión.
- Recuperación y cambio de contraseña.
- Consulta y edición del perfil propio.
- Gestión de los roles Usuario, Conserje y Administrador.
- Inicio de sesión OAuth como capacidad opcional si se mantiene en el alcance técnico.

### S-02 — Gestión de hallazgos por Conserjería

Los Conserjes podrán:

- Publicar objetos encontrados únicamente en su facultad asignada.
- Registrar categoría, descripción, fecha, centro o punto de custodia e imágenes cuando proceda.
- Añadir rasgos identificativos no públicos para facilitar la validación de una recuperación.
- Consultar, editar y retirar sus hallazgos.
- Marcar un hallazgo como Devuelto cuando se complete la recuperación.

Los Usuarios podrán consultar hallazgos activos, pero no crear ni modificar publicaciones de hallazgos.

### S-03 — Búsqueda guiada de objetos perdidos

Los Usuarios podrán:

- Indicar la categoría y la descripción básica del objeto perdido.
- Seleccionar la facultad o el centro donde se produjo la pérdida.
- Consultar un listado de hallazgos coincidentes en el ámbito indicado.
- Consultar el detalle público de los hallazgos sin acceder a los rasgos privados del objeto.
- Iniciar una solicitud de recuperación desde un hallazgo compatible.

La búsqueda de hallazgos se basa en los datos introducidos por el Usuario y no crea automáticamente un aviso de pérdida.

### S-04 — Solicitud y validación de recuperación

Los Usuarios podrán:

- Solicitar la recuperación de un hallazgo desde su detalle.
- Aportar información adicional que permita demostrar la propiedad del objeto.
- Consultar el estado de sus solicitudes.
- Recibir un aviso cuando el Conserje valide o rechace la solicitud.

Los Conserjes podrán:

- Consultar las solicitudes Pendientes asociadas a su facultad.
- Revisar la información aportada por el Usuario.
- Validar o rechazar la solicitud indicando un motivo cuando corresponda.
- Emitir un aviso al Usuario tras la decisión.

La aplicación registra la decisión, pero no certifica jurídicamente la propiedad ni gestiona por sí misma la entrega física.

### S-05 — Feed independiente de pérdidas

Los Usuarios podrán:

- Publicar avisos de objetos perdidos.
- Incluir descripción, categoría, facultad o centro, fecha y datos de contacto adicionales.
- Consultar, editar y cerrar sus propios avisos.
- Consultar los avisos publicados por otros Usuarios si están dentro del alcance público.

Los avisos de pérdidas:

- No son hallazgos registrados por Conserjería.
- No se utilizan como fuente automática de coincidencias con hallazgos.
- No generan solicitudes de recuperación ni validaciones de Conserjería por sí mismos.
- Mantienen su propio estado e historial.

### S-06 — Administración

Los Administradores podrán:

- Gestionar cuentas y estados de usuario.
- Conceder y revocar los roles Conserje y Administrador respetando la protección del último Administrador activo.
- Crear y mantener facultades, centros, categorías y puntos de custodia.
- Asignar cada Conserje a una facultad.
- Consultar la auditoría de cambios administrativos.

### S-07 — Producto revisable

El producto incluirá:

- Datos de demostración ficticios de los tres roles.
- Facultades, centros, categorías, hallazgos, avisos de pérdidas y solicitudes en estados representativos.
- Documentación de instalación y ejecución.
- Pruebas de los flujos principales y de los permisos por rol.

## 6. Estados del sistema

| Elemento | Estados y transiciones |
| --- | --- |
| Hallazgo de Conserjería | `Activo → Devuelto` o `Activo → Retirado` |
| Solicitud de recuperación | `Pendiente → Validada` o `Pendiente → Rechazada` |
| Aviso de pérdida | `Activo → Cerrado` |

Reglas de transición:

- Solo un Conserje asignado a la facultad del hallazgo puede editarlo, retirarlo o marcarlo como Devuelto.
- Solo un Conserje asignado a la facultad del hallazgo puede validar o rechazar su solicitud de recuperación.
- Una solicitud `Validada` o `Rechazada` no vuelve a `Pendiente`; para reintentar debe crearse una nueva solicitud si el producto lo permite.
- Un Usuario solo puede editar o cerrar sus propios avisos de pérdida.
- Los estados finales no aparecen en los listados activos, pero conservan la información e historial necesarios.
- La notificación se registra como `Emitida` cuando el sistema genera el aviso; no implica que el Usuario lo haya leído.
- Cada transición registra fecha, actor, motivo cuando corresponda y ámbito territorial afectado.

La entrega física se realiza según las instrucciones del Conserje y las normas de la facultad. El sistema registra la decisión de recuperación, pero no certifica por sí mismo la entrega física.

## 7. Plan de ejecución en seis iteraciones

| Iteración | Objetivo principal | Alcance |
| --- | --- | --- |
| IT-01 | Cuenta, identidad y roles base | S-01; EP-001 |
| IT-02 | Publicación de hallazgos por Conserjería | S-02; parte de EP-002 |
| IT-03 | Búsqueda guiada y feed de pérdidas | S-03 y S-05; EP-003 y parte de EP-002 |
| IT-04 | Solicitudes y validación de recuperación | S-04; EP-004 |
| IT-05 | Administración y asignaciones | S-06; EP-005 |
| IT-06 | Implementación de historias adicionales y revisión final | Historias adicionales definidas para la iteración, S-07 |

### Distribución de historias por iteración

La capacidad efectiva disponible es de 40 h-p por semana. Las historias se asignan respetando sus predecesoras y procurando equilibrar la carga. IT-06 se orienta principalmente a implementar las historias adicionales definidas para esta iteración, incluyendo las de trazabilidad, reportes y auditoría que pueden completarse después de los flujos funcionales. También reserva capacidad para integración, documentación, datos de demostración, pruebas globales y revisión final.

| Iteración | Historias | Carga estimada |
| --- | --- | ---: |
| IT-01 | US-001, US-002, US-003, US-005 | 25 h-p |
| IT-02 | US-004, US-006, US-007, US-009 | 35 h-p |
| IT-03 | US-010, US-011, US-013, US-014 | 31 h-p |
| IT-04 | US-015, US-016, US-017, US-018, US-019, US-023 | 35 h-p |
| IT-05 | US-012, US-020, US-024, US-025 | 34 h-p |
| IT-06 | US-021, US-022, US-026 | 18 h-p |

La carga máxima es de 35 h-p en IT-02 e IT-04, por debajo de la capacidad efectiva de 40 h-p por iteración. La suma de las estimaciones por iteración es 178 h-p (25 + 35 + 31 + 35 + 34 + 18), y coincide con la suma de las estimaciones de las épicas: EP-001 (46 h-p), EP-002 (46 h-p), EP-003 (24 h-p), EP-004 (31 h-p) y EP-005 (31 h-p). No se incluye trabajo técnico transversal no desglosado en historias.

Las historias no se consideran completas hasta cumplir la Definition of Done, sus criterios de aceptación y las restricciones aplicables.

## 8. Supuestos

- A-01: Los usuarios y Conserjes dispondrán de conexión a Internet.
- A-02: Cada Conserje tendrá una facultad asignada por un Administrador antes de publicar o validar operaciones.
- A-03: Las facultades y centros utilizados durante las pruebas estarán previamente definidos.
- A-04: Los Conserjes podrán consultar la información necesaria para gestionar los objetos depositados en su facultad.
- A-05: La entrega física se realizará fuera de la aplicación siguiendo las instrucciones del Conserje.
- A-06: Los datos de desarrollo, pruebas y demostración serán ficticios o sintéticos.
- A-07: Los avisos de pérdidas son un canal independiente de los hallazgos de Conserjería.

## 9. Restricciones

- R-01: El proyecto deberá completarse dentro del periodo establecido.
- R-02: El producto deberá mantenerse dentro del alcance definido en este documento.
- R-03: No se utilizarán datos personales reales durante desarrollo, pruebas ni demostración.
- R-04: Todas las entradas deberán validarse antes de procesarse.
- R-05: Las operaciones deberán respetar los permisos del rol y la facultad asignada.
- R-06: Las contraseñas locales se almacenarán únicamente mediante un mecanismo de hash seguro.
- R-07: La información privada de hallazgos y solicitudes no será visible en listados públicos.
- R-08: Las solicitudes de recuperación solo podrán ser revisadas por Conserjes de la facultad correspondiente.
- R-09: La aplicación mostrará mensajes comprensibles ante errores y operaciones no permitidas.
- R-10: Las funcionalidades principales deberán poder verificarse mediante pruebas.
- R-11: Los cambios de estado y decisiones de recuperación deberán conservar trazabilidad.
- R-12: El feed de pérdidas no podrá modificar ni crear automáticamente hallazgos o solicitudes de recuperación.

## 10. Trazabilidad

La trazabilidad seguirá la cadena:

Misión → objetivos → épicas → historias de usuario → tareas → código y pruebas → evidencias

| Épica | Nombre | Alcance | Objetivos | Indicadores |
| --- | --- | --- | --- | --- |
| EP-01 | Gestión de cuenta, identidad y perfil | S-01 | G-05 | M-05 |
| EP-02 | Gestión y exploración de hallazgos | S-02 | G-01 | M-01 |
| EP-03 | Búsqueda y avisos de pérdidas | S-03, S-05 | G-02, G-04 | M-02, M-04 |
| EP-04 | Solicitudes y validación de recuperación | S-04 | G-03 | M-03 |
| EP-05 | Administración y asignaciones | S-06 | G-05 | M-05 |

S-07 y las condiciones de calidad, documentación, pruebas e instalación se verifican transversalmente durante IT-06 y no constituyen una épica funcional independiente.

## 11. Gestión de cambios

Cualquier modificación de un objetivo, indicador, alcance, rol, estado, supuesto o restricción deberá:

- Ser revisada por el equipo.
- Justificarse respecto a las necesidades del producto.
- Ser aprobada explícitamente por el Product Owner.
- Registrar la decisión y su fecha.
- Evaluar su impacto sobre plazo, capacidad, coste y trazabilidad.
- Actualizar las especificaciones y referencias afectadas.

## 12. Registro de decisiones y cambios

| ID | Fecha | Decisión | Apartados afectados |
| --- | --- | --- | --- |
| D-01 | 30/09/2026 | Los rasgos identificativos de los hallazgos no son públicos y solo están disponibles en operaciones autorizadas. | S-02, S-03, S-04, R-07 |
| D-02 | 30/09/2026 | Los avisos de pérdidas y los hallazgos de Conserjería son canales diferenciados. | S-02, S-03, S-05, A-07 |
| D-03 | 14/10/2026 | Se definen tres roles: Usuario, Conserje y Administrador. | S-01, S-06, G-05 |
| D-04 | 14/10/2026 | Cada Conserje queda asignado a una facultad y solo puede gestionar hallazgos y solicitudes de ese ámbito. | S-02, S-04, S-06, R-05, R-08 |
| D-05 | 14/10/2026 | Los Usuarios no publican hallazgos; los hallazgos solo pueden ser publicados por Conserjes. | S-02, G-01 |
| D-06 | 14/10/2026 | La búsqueda de objetos perdidos se realiza mediante un formulario de categoría, descripción y facultad o centro, mostrando coincidencias de hallazgos. | S-03, G-02 |
| D-07 | 14/10/2026 | La recuperación se solicita mediante un formulario con información justificativa, queda Pendiente y requiere validación de un Conserje antes de emitir el aviso al Usuario. | S-04, G-03 |
| D-08 | 14/10/2026 | Se elimina el contacto externo como mecanismo de recuperación y se sustituye por solicitudes gestionadas dentro de la aplicación. | S-04, R-08 |
| D-09 | 14/10/2026 | Los avisos de pérdidas permanecen desacoplados de los hallazgos de Conserjería y no generan coincidencias ni solicitudes automáticamente. | S-05, R-12 |
| D-10 | 14/10/2026 | Se mantiene una planificación de seis iteraciones; IT-06 prioriza la implementación de historias adicionales y mantiene la integración, demostración, documentación y revisión final transversal. | Plan de ejecución, S-07, G-06 |
