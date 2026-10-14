## 1. Objetivos
 
Los objetivos del proyecto concretan los resultados que Lost&Found UEx debe alcanzar durante el periodo de desarrollo. Estos objetivos deben ser medibles, alcanzables y estar directamente relacionados con la misión del producto.
 
| ID | Objetivo | Resultado esperado |
| --- | --- | --- |
| G-01 | Registro y consulta de objetos | El usuario puede registrar un objeto perdido o encontrado y consultar los objetos disponibles mediante un recorrido sencillo y comprensible. |
| G-02 | Contacto para la recuperación | El usuario puede contactar con el autor de un hallazgo para comunicar que busca ese objeto y acordar su recuperación fuera de la aplicación. |
| G-03 | Trazabilidad y confianza | El sistema mantiene información clara sobre el estado de las publicaciones y de los contactos iniciados. |
| G-04 | Acceso controlado | Los usuarios pueden identificarse mediante un proveedor de autenticación externo y las operaciones disponibles se adaptan a su rol dentro del sistema. |
| G-05 | Producto revisable | Una persona que no haya participado en el desarrollo puede instalar, ejecutar y evaluar el producto siguiendo la documentación proporcionada. |
 
## 2. Indicadores de éxito
 
Los indicadores permiten comprobar objetivamente si los objetivos definidos se han alcanzado.
 
| ID | Objetivo | Indicador | Meta |
| --- | --- | --- | --- |
| M-01 | G-01 | Usuarios que completan el registro de un objeto | Al menos 4 de 5 participantes completan el proceso sin ayuda y en menos de 5 minutos. |
| M-02 | G-01 | Usuarios que encuentran un objeto mediante búsqueda | Al menos 4 de 5 participantes localizan correctamente un objeto concreto mediante los filtros disponibles. |
| M-03 | G-02 | Usuarios que contactan sobre un hallazgo | Al menos 4 de 5 participantes completan correctamente un contacto sobre un hallazgo sin ayuda. |
| M-04 | G-03 | Estados correctamente reflejados | El 100 % de las publicaciones utilizadas en las pruebas muestran correctamente su estado actual y su historial básico; los contactos registran únicamente su inicio, sin asumir que el correo haya sido enviado, recibido o leído. |
| M-05 | G-04 | Acceso y autorización | El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado. |
| M-06 | G-05 | Instalación y ejecución | Una persona que no haya implementado el producto puede seguir la documentación y ejecutar el sistema sin intervenciones no documentadas. |
| M-07 | Todos | Defectos bloqueantes | No existe ningún defecto bloqueante abierto durante la revisión final. |
 
## 3. Stakeholders
 
| ID | Stakeholder | Interés | Influencia | Estrategia |
| --- | --- | --- | --- | --- |
| SH-01 | Estudiantes y personal UEx (Usuario) | Recuperar objetos rápido y con confianza | Media | Pruebas de usabilidad M-01 a M-03 con 5 participantes |
| SH-02 | Administrador de la aplicación | Mantener categorías, ubicaciones y configuración sin tocar código | Baja | Mantener informado; alcance S-06 |
| SH-03 | Profesorado de GPS | Línea base realista, trazabilidad y calidad | Muy alta | Gestionar de cerca: hitos H1–H4 y entregas |
| SH-04 | Equipo de desarrollo | Alcance estable y bien especificado | Alta | Refinamiento semanal del backlog |
| SH-05 | Revisor externo (M-06) | Instalar y evaluar sin ayuda | Media | Documentación de instalación en la release 3 |
| SH-06 | Protección de datos UEx | Ningún dato personal real | Media | Cumplir R-03 y A-07 con datos sintéticos |
 
## 4. Alcance incluido
 
El proyecto incluye las funcionalidades necesarias para proporcionar un recorrido completo de registro, búsqueda y recuperación de objetos perdidos.
 
### S-01 — Autenticación
 
- Inicio de sesión mediante un proveedor externo de autenticación.
- Creación del usuario en el sistema tras el primer acceso, con rol *Usuario* por defecto.
- Cierre de sesión.
- Identificación del usuario durante sus operaciones.
- Gestión de roles básicos: Usuario y Administrador.
### S-02 — Feed de hallazgos
 
Los usuarios autenticados podrán:
 
- Registrar un objeto encontrado.
- Introducir información pública y rasgos identificativos privados.
- Indicar una ubicación aproximada y fecha del hallazgo.
- Indicar, cuando proceda, un punto de entrega.
- Consultar el feed y el detalle público de los hallazgos activos.
- Buscar y filtrar por texto, categoría, ubicación y estado.
- Editar y cerrar un hallazgo propio.
### S-03 — Feed de solicitudes de búsqueda

El sistema permitirá:

- Publicar una solicitud de búsqueda sobre un objeto perdido.
- Consultar solicitudes de búsqueda activas.
- Buscar por texto.
- Filtrar por categoría.
- Filtrar por ubicación.
- Filtrar por estado.
- Consultar la información pública asociada a una solicitud. La información pública incluye categoría, ubicación aproximada, fecha y descripción; la información privada no se publica en el feed.
- Editar y cerrar una solicitud propia.

### S-04 — Contacto sobre un hallazgo

Los usuarios autenticados podrán:

- Contactar con el autor de un hallazgo activo mediante un formulario.
- Proporcionar información que permita identificar el objeto buscado.
- Abrir un mensaje de correo preconfigurado mediante un enlace `mailto:`.
- Consultar el estado básico del contacto y volver a iniciarlo si fuera necesario.
- Mantener Reply-To como una posible mejora si su viabilidad técnica se confirma.

### S-05 — Cierre y trazabilidad de publicaciones

Los usuarios podrán:

- Cerrar sus propias publicaciones cuando el caso ya no esté activo.
- Consultar el estado básico y el historial de sus publicaciones y contactos.
- La aplicación no certificará la propiedad ni gestionará la custodia o la entrega física.
### S-06 — Gestión administrativa
 
Los usuarios con rol Administrador podrán:
 
- Gestionar las categorías disponibles.
- Gestionar las ubicaciones y puntos de entrega utilizados por el sistema.
- Consultar la información necesaria para mantener el funcionamiento de la aplicación.
### S-07 — Datos de demostración
 
El sistema incluirá un conjunto controlado de objetos, usuarios y operaciones ficticias que permita demostrar y evaluar los flujos principales del producto.
 
### Estados del sistema
 
| Elemento | Estados |
| --- | --- |
| Hallazgo | Activo → Cerrado |
| Solicitud de búsqueda | Activa → Cerrada |
| Contacto sobre un hallazgo | Iniciado |
 
La entrega física y cualquier acuerdo sobre la recuperación se realizan fuera de la aplicación. Cada cambio de estado gestionado por el sistema genera un evento básico de historial con fecha, usuario y motivo cuando corresponda.
 
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
- R-07: El sistema deberá mantener la trazabilidad básica del estado de las publicaciones y de los contactos iniciados.
- R-08: La aplicación deberá proporcionar mensajes comprensibles ante errores y operaciones no permitidas.
- R-09: Las funcionalidades principales deberán poder ser verificadas mediante pruebas.
- R-10: El proyecto deberá respetar las tecnologías y convenciones aprobadas para la asignatura.
- R-11: Los rasgos identificativos de un hallazgo no serán visibles en el feed público ni en las respuestas públicas de la API; solo estarán disponibles para el autor del hallazgo en las operaciones autorizadas.
## 7. Trazabilidad
 
La trazabilidad del proyecto seguirá la siguiente cadena:
 
Misión → objetivos → épicas → historias de usuario → tareas → código y pruebas → evidencias
 
Cada épica y funcionalidad deberá contribuir al menos a uno de los objetivos definidos en este documento.
 
| Épica | Nombre | Alcance | Objetivos | Indicadores |
| --- | --- | --- | --- | --- |
| EP-01 | Acceso y perfiles | S-01 | G-04 | M-05 |
| EP-02 | Feed de hallazgos | S-02 | G-01 | M-01 |
| EP-03 | Feed de solicitudes | S-03 | G-01 | M-02 |
| EP-04 | Contacto y trazabilidad | S-04, S-05, R-07 | G-02, G-03 | M-03, M-04 |
| EP-05 | Administración | S-06 | G-04 | M-05 |
 
Una funcionalidad que no contribuya a ningún objetivo se considerará fuera del alcance hasta que se apruebe explícitamente un cambio en goals.md.

S-07, R-08 y R-09 son requisitos transversales a todas las épicas y se comprobarán mediante los criterios de salida de cada release. Su cumplimiento contribuirá a G-05 y se verificará mediante M-06 y M-07, sin constituir una épica funcional independiente.
 
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
| D-01 | 30/09/2026 | Los rasgos identificativos de los hallazgos no son públicos y solo puede consultarlos el autor del hallazgo en operaciones autorizadas. | S-02, S-03, S-04, R-11 |
| D-02 | 30/09/2026 | Los hallazgos y las solicitudes de búsqueda son publicaciones independientes y no existe emparejamiento automático. | S-02, S-03 |
| D-03 | 30/09/2026 | La recuperación y la entrega física se acuerdan entre usuarios fuera de la aplicación. | S-04, S-05, A-05, A-06 |
| D-04 | 30/09/2026 | Todo usuario nuevo entra como Usuario; el Administrador mantiene la configuración general y no interviene en cada contacto. | S-01, S-06 |
| D-05 | 30/09/2026 | Inicialmente, el contacto sobre un hallazgo se realizará mediante un enlace `mailto:` y no mediante chat interno. Se podrá valorar una integración con Reply-To si resulta viable dentro del alcance. | S-04 |
| D-06 | 30/09/2026 | El autor puede editar y cerrar su publicación; no existe borrado físico. | S-02, S-03, S-05 |
| D-07 | 30/09/2026 | La aplicación no certifica la propiedad ni gestiona la custodia o la entrega física. | S-04, S-05, A-05, A-06 |
| D-08 | 30/09/2026 | Los cambios de estado de publicaciones y contactos generan un historial básico. | S-05, M-04, Estados |
| C-01 | 30/09/2026 | Se añade la sección de stakeholders y la tabla de épicas a la trazabilidad. | 3, 8 |
| D-09 | 12/10/2026 | Los requisitos de producto revisable se mantienen como condiciones transversales de release y no como una épica funcional independiente. | 7, S-07, R-08, R-09, G-05, M-06, M-07 |
| D-10 | 14/10/2026 | Se remodela el producto como dos feeds relacionados: hallazgos y solicitudes de búsqueda. Se elimina el rol Responsable y el contacto se realiza mediante correo electrónico; la recuperación física se negocia fuera de la aplicación. | S-01, S-02, S-03, S-04, S-05, S-06, R-07, R-11, G-02, G-03, M-03, M-04 |