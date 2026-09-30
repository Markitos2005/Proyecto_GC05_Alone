## 1. Objetivos
 
Los objetivos del proyecto concretan los resultados que Lost&Found UEx debe alcanzar durante el periodo de desarrollo. Estos objetivos deben ser medibles, alcanzables y estar directamente relacionados con la misión del producto.
 
| ID | Objetivo | Resultado esperado |
| --- | --- | --- |
| G-01 | Registro y consulta de objetos | El usuario puede registrar un objeto perdido o encontrado y consultar los objetos disponibles mediante un recorrido sencillo y comprensible. |
| G-02 | Recuperación de objetos | El usuario puede solicitar la recuperación de un objeto encontrado y el responsable puede revisar la solicitud y gestionar su devolución. |
| G-03 | Trazabilidad y confianza | El sistema mantiene información clara sobre el estado de cada objeto y de sus solicitudes de recuperación. |
| G-04 | Acceso controlado | Los usuarios pueden identificarse mediante un proveedor de autenticación externo y las operaciones disponibles se adaptan a su rol dentro del sistema. |
| G-05 | Incremento revisable | Una persona que no haya participado en el desarrollo puede instalar, ejecutar y evaluar el producto siguiendo la documentación proporcionada. |
 
## 2. Indicadores de éxito
 
Los indicadores permiten comprobar objetivamente si los objetivos definidos se han alcanzado.
 
| ID | Objetivo | Indicador | Meta |
| --- | --- | --- | --- |
| M-01 | G-01 | Usuarios que completan el registro de un objeto | Al menos 4 de 5 participantes completan el proceso sin ayuda y en menos de 5 minutos. |
| M-02 | G-01 | Usuarios que encuentran un objeto mediante búsqueda | Al menos 4 de 5 participantes localizan correctamente un objeto concreto mediante los filtros disponibles. |
| M-03 | G-02 | Usuarios que completan una solicitud de recuperación | Al menos 4 de 5 participantes completan correctamente una reclamación sin ayuda. |
| M-04 | G-03 | Estados correctamente reflejados | El 100 % de los objetos y solicitudes utilizados en las pruebas muestran correctamente su estado actual y su historial de cambios. |
| M-05 | G-04 | Acceso y autorización | El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado. |
| M-06 | G-05 | Instalación y ejecución | Una persona que no haya implementado el producto puede seguir la documentación y ejecutar el sistema sin intervenciones no documentadas. |
| M-07 | Todos | Defectos bloqueantes | No existe ningún defecto bloqueante abierto durante la revisión final. |
 
## 3. Stakeholders
 
| ID | Stakeholder | Interés | Influencia | Estrategia |
| --- | --- | --- | --- | --- |
| SH-01 | Estudiantes y personal UEx (Usuario) | Recuperar objetos rápido y con confianza | Media | Pruebas de usabilidad M-01 a M-03 con 5 participantes |
| SH-02 | Personal de conserjería (Responsable) | Menos consultas presenciales y control de devoluciones | Alta | Validar el flujo de reclamación en cada Sprint Review |
| SH-03 | Administrador de la aplicación | Mantener categorías, ubicaciones y roles sin tocar código | Baja | Mantener informado; alcance S-06 |
| SH-04 | Cliente simulado (conserjerías UEx) | Servicio centralizado y trazable | Alta | Aprueba cambios de alcance; revisión al final de cada release |
| SH-05 | Profesorado de GPS | Línea base realista, trazabilidad y calidad | Muy alta | Gestionar de cerca: hitos H1–H4 y entregas |
| SH-06 | Equipo de desarrollo | Alcance estable y bien especificado | Alta | Refinamiento semanal del backlog |
| SH-07 | Revisor externo (M-06) | Instalar y evaluar sin ayuda | Media | Documentación de instalación en la release 3 |
| SH-08 | Protección de datos UEx | Ningún dato personal real | Media | Cumplir R-03 y A-07 con datos sintéticos |
 
## 4. Alcance incluido
 
El proyecto incluye las funcionalidades necesarias para proporcionar un recorrido completo de registro, búsqueda y recuperación de objetos perdidos.
 
### S-01 — Autenticación
 
- Inicio de sesión mediante un proveedor externo de autenticación.
- Creación del usuario en el sistema tras el primer acceso, con rol *Usuario* por defecto.
- Cierre de sesión.
- Identificación del usuario durante sus operaciones.
- Gestión de roles básicos: Usuario, Responsable y Administrador.
### S-02 — Gestión de objetos
 
Los usuarios podrán:
 
- Registrar un objeto perdido (aviso de pérdida).
- Registrar un objeto encontrado.
- Introducir información descriptiva del objeto, separando la descripción pública de los rasgos identificativos ocultos.
- Indicar una ubicación y fecha asociadas.
- Indicar el punto de entrega donde se deposita un objeto encontrado.
- Consultar el detalle de un objeto.
- Consultar sus propios objetos registrados.
- Editar un objeto propio mientras no tenga solicitudes de recuperación.
- Cerrar un aviso de pérdida propio.
### S-03 — Búsqueda y consulta
 
El sistema permitirá:
 
- Consultar objetos registrados.
- Buscar por texto.
- Filtrar por categoría.
- Filtrar por ubicación.
- Filtrar por estado.
- Consultar la información pública asociada a un objeto. La información pública incluye categoría, ubicación, fecha y descripción genérica; los rasgos identificativos no son públicos.
### S-04 — Reclamación de objetos
 
Los usuarios podrán:
 
- Solicitar la recuperación de un objeto encontrado.
- Proporcionar información adicional para demostrar que el objeto les pertenece.
- Consultar el estado de sus solicitudes.
- Recibir un aviso dentro de la aplicación cuando cambie el estado de una solicitud.
- Cancelar una solicitud propia mientras siga pendiente.
### S-05 — Gestión de reclamaciones
 
Los usuarios con permisos de responsable podrán:
 
- Confirmar la recepción de un objeto encontrado en su punto de entrega.
- Consultar las solicitudes pendientes.
- Revisar la información proporcionada por el reclamante junto a los rasgos ocultos del objeto.
- Aprobar o rechazar una solicitud indicando un motivo.
- Marcar un objeto como devuelto.
- Consultar el historial asociado a la gestión.
### S-06 — Gestión administrativa
 
Los usuarios con permisos administrativos podrán:
 
- Gestionar las categorías disponibles.
- Gestionar las ubicaciones y puntos de entrega utilizados por el sistema.
- Asignar y retirar el rol Responsable.
- Consultar la información necesaria para mantener el funcionamiento de la aplicación.
### S-07 — Datos de demostración
 
El sistema utilizará un conjunto controlado de objetos, usuarios y operaciones ficticias para permitir la demostración y evaluación del producto.
 
### Estados del sistema
 
| Elemento | Estados |
| --- | --- |
| Objeto encontrado | Pendiente de entrega → Disponible → En reclamación → Devuelto |
| Aviso de pérdida | Activo → Cerrado |
| Solicitud de recuperación | Pendiente → Aprobada / Rechazada; Cancelada si el reclamante la retira antes de su revisión |
 
Cada cambio de estado genera un evento de historial con fecha, usuario y motivo.
 
## 5. Supuestos
 
El proyecto se desarrolla bajo los siguientes supuestos:
 
- A-01: Los usuarios dispondrán de conexión a Internet para utilizar la aplicación.
- A-02: El proveedor externo de autenticación utilizado estará disponible durante las pruebas.
- A-03: Los usuarios proporcionarán información suficiente para describir los objetos registrados.
- A-04: Las ubicaciones y puntos de entrega utilizados por el sistema serán previamente conocidos y estarán representados mediante un conjunto controlado de datos.
- A-05: Las operaciones de entrega y devolución física de los objetos se realizarán fuera del sistema.
- A-06: El sistema se utilizará como herramienta de gestión y coordinación y no como mecanismo oficial de custodia de objetos.
- A-07: Los datos empleados durante el desarrollo, las pruebas y la demostración serán ficticios o sintéticos.
- A-08: La integración con un proveedor de autenticación externo será suficiente para demostrar el proceso de identificación de usuarios.
- A-09: Quien encuentra un objeto lo deposita en el punto de entrega indicado al registrarlo.
## 6. Restricciones
 
El proyecto deberá respetar las siguientes condiciones:
 
- R-01: El desarrollo deberá completarse dentro del periodo de ejecución establecido para el proyecto.
- R-02: El producto deberá mantenerse dentro del alcance definido en este documento.
- R-03: No se utilizarán datos personales reales durante el desarrollo, las pruebas ni la demostración.
- R-04: Las entradas proporcionadas por los usuarios deberán validarse antes de ser procesadas.
- R-05: Las operaciones deberán respetar los permisos asociados al rol del usuario.
- R-06: Las credenciales de los usuarios no serán almacenadas directamente por la aplicación cuando se utilice autenticación mediante un proveedor externo.
- R-07: El sistema deberá mantener la trazabilidad del estado de los objetos y de las solicitudes de recuperación.
- R-08: La aplicación deberá proporcionar mensajes comprensibles ante errores y operaciones no permitidas.
- R-09: Las funcionalidades principales deberán poder ser verificadas mediante pruebas.
- R-10: El proyecto deberá respetar las tecnologías y convenciones aprobadas para la asignatura.
- R-11: Los rasgos identificativos de un objeto encontrado solo serán visibles para responsables y administradores, tanto en la interfaz como en las respuestas de la API.
## 7. Trazabilidad
 
La trazabilidad del proyecto seguirá la siguiente cadena:
 
Misión → objetivos → épicas → historias de usuario → tareas → código y pruebas → evidencias
 
Cada épica y funcionalidad deberá contribuir al menos a uno de los objetivos definidos en este documento.
 
| Épica | Nombre | Alcance | Objetivos | Indicadores |
| --- | --- | --- | --- | --- |
| EP-01 | Autenticación y roles | S-01 | G-04 | M-05 |
| EP-02 | Registro de objetos | S-02 | G-01 | M-01 |
| EP-03 | Búsqueda y consulta | S-03 | G-01 | M-02 |
| EP-04 | Solicitud de recuperación | S-04 | G-02 | M-03 |
| EP-05 | Gestión de reclamaciones y devoluciones | S-05 | G-02, G-03 | M-03, M-04 |
| EP-06 | Administración | S-06 | G-04 | M-05 |
| EP-07 | Trazabilidad e historial | S-05, R-07 | G-03 | M-04 |
| EP-08 | Producto revisable | S-07, R-08, R-09 | G-05 | M-06, M-07 |
 
Una funcionalidad que no contribuya a ningún objetivo se considerará fuera del alcance hasta que se apruebe explícitamente un cambio en goals.md.
 
## 8. Gestión de cambios
 
Cualquier modificación de un objetivo, indicador, alcance, exclusión, supuesto o restricción deberá:
 
- Ser revisada por el equipo.
- Ser justificada respecto a las necesidades del producto.
- Ser aprobada explícitamente por el Product Owner.
- Registrar la decisión y su fecha.
- Evaluar su impacto sobre el plazo, la capacidad y el coste.
- Revisar las especificaciones, el backlog, la planificación y las tareas afectadas.
- Actualizar las referencias afectadas para mantener la trazabilidad.
## 9. Registro de decisiones y cambios
 
| ID | Fecha | Decisión | Apartados afectados |
| --- | --- | --- | --- |
| D-01 | 30/09/2026 | Los rasgos identificativos de los objetos encontrados no son públicos; el reclamante demuestra la propiedad describiéndolos. | S-02, S-03, S-05, R-11 |
| D-02 | 30/09/2026 | Los avisos de pérdida son públicos y no hay emparejamiento automático. | S-02, EX-08 |
| D-03 | 30/09/2026 | Quien registra un objeto encontrado indica el punto de entrega; el responsable confirma la recepción. | S-02, S-05, S-06, A-04, A-09 |
| D-04 | 30/09/2026 | Todo usuario nuevo entra como Usuario; el administrador asigna el rol Responsable, que gestiona todas las ubicaciones. | S-01, S-06, EX-12 |
| D-05 | 30/09/2026 | Se permiten varias solicitudes por objeto; al aprobar una, las demás se rechazan automáticamente con motivo. | S-05, Estados |
| D-06 | 30/09/2026 | El autor puede editar su objeto sin solicitudes y cerrar su aviso de pérdida; no existe borrado. | S-02, EX-11 |
| D-07 | 30/09/2026 | Solo notificaciones dentro de la aplicación. | S-04, EX-10 |
| D-08 | 30/09/2026 | Cada cambio de estado genera un evento de historial visible para responsables y administradores. | S-05, M-04, Estados |
| C-01 | 30/09/2026 | Se añade la sección de stakeholders y la tabla de épicas a la trazabilidad. | 3, 8 |
 
Impacto: los cambios añaden las historias US-10, US-22, US-24 y US-25 al backlog. Ninguna afecta a la release 1; US-24 y US-25 tienen prioridad Could y pueden salir del alcance si la capacidad no alcanza.