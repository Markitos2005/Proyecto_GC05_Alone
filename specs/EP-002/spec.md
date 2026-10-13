# EP-002 — Registro de objetos

## Épica

Como usuario de Lost&Found UEx, quiero registrar y gestionar avisos de objetos perdidos o encontrados, para dejar constancia organizada de la información necesaria para su localización y recuperación.

- **Objetivos relacionados:** G-01
- **Alcance relacionado:** S-02 — Gestión de objetos
- **Indicador relacionado:** M-01 — Usuarios que completan el registro de un objeto
- **Prioridad:** Must
- **Estimación:** 20 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** Release 1, Iteración 2

## Historias de usuario

### US-005 — Registrar un objeto perdido

Como usuario autenticado, quiero registrar un objeto que he perdido, para publicar un aviso que ayude a localizarlo y recuperarlo.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-001, US-002
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-005-AC-01:** El usuario autenticado puede iniciar un registro de tipo objeto perdido.
- **US-005-AC-02:** El usuario puede indicar una categoría, una descripción genérica, una ubicación y una fecha asociadas al aviso.
- **US-005-AC-03:** Al completar correctamente el registro, el aviso se crea con estado Activo y queda asociado al usuario que lo registró.
- **US-005-AC-04:** El sistema no crea el aviso si faltan datos obligatorios o alguno de los valores no supera la validación.

#### Verificación y restricciones

- Verificar que al menos 4 de 5 participantes completan el registro sin ayuda y en menos de 5 minutos.
- Probar la validación de campos obligatorios, formatos y valores no válidos.
- Cumplir R-03, R-04, R-05, R-08 y A-03.

### US-006 — Registrar un objeto encontrado

Como usuario autenticado, quiero registrar un objeto que he encontrado, para informar de su existencia y facilitar que su propietario pueda solicitar la recuperación.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-006-AC-01:** El usuario autenticado puede iniciar un registro de tipo objeto encontrado.
- **US-006-AC-02:** El usuario puede indicar una categoría, una descripción pública, los rasgos identificativos ocultos, una ubicación y una fecha.
- **US-006-AC-03:** El usuario puede indicar el punto de entrega donde deposita el objeto encontrado.
- **US-006-AC-04:** Al completar correctamente el registro, el objeto se crea con estado Pendiente de entrega y queda asociado al usuario que lo registró.
- **US-006-AC-05:** El sistema no muestra los rasgos identificativos ocultos como información pública.

#### Verificación y restricciones

- Verificar que los datos públicos y los rasgos identificativos se almacenan y muestran de forma separada.
- Verificar que el punto de entrega utilizado pertenece al conjunto controlado de ubicaciones disponibles.
- Cumplir R-03, R-04, R-05, R-08, R-11, A-04 y A-09.

### US-007 — Consultar los objetos propios

Como usuario autenticado, quiero consultar el detalle y el listado de mis objetos registrados, para revisar la información y el estado de cada aviso u objeto encontrado.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-005, US-006
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-007-AC-01:** El usuario puede consultar un listado de los objetos y avisos que ha registrado.
- **US-007-AC-02:** El usuario puede consultar el detalle de cada objeto propio, incluyendo su tipo, información descriptiva, ubicación, fecha y estado.
- **US-007-AC-03:** El usuario no puede consultar desde esta funcionalidad objetos privados registrados por otros usuarios ni modificar su información.
- **US-007-AC-04:** Los rasgos identificativos de un objeto encontrado solo se muestran a los perfiles autorizados.

#### Verificación y restricciones

- Verificar el aislamiento de los objetos propios entre dos usuarios autenticados distintos.
- Verificar que el estado mostrado coincide con el estado almacenado por el sistema.
- Cumplir R-05, R-07 y R-11.

### US-008 — Editar un objeto propio

Como usuario autenticado, quiero editar un objeto propio mientras no tenga solicitudes de recuperación, para corregir o completar su información sin alterar un proceso de reclamación iniciado.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-005, US-006, US-007
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-008-AC-01:** El autor puede editar la información de un objeto propio que todavía no tenga solicitudes de recuperación.
- **US-008-AC-02:** El sistema valida los datos modificados antes de guardarlos.
- **US-008-AC-03:** Cuando un objeto tiene al menos una solicitud de recuperación, el autor no puede editarlo y recibe un mensaje comprensible.
- **US-008-AC-04:** Un usuario no puede editar objetos registrados por otra persona.

#### Verificación y restricciones

- Verificar la edición permitida antes de una solicitud y el bloqueo posterior a la primera solicitud.
- Verificar que una edición rechazada no modifica los datos existentes.
- Cumplir D-06, R-04, R-05, R-08 y A-03.

### US-009 — Cerrar un aviso de pérdida

Como usuario autenticado, quiero cerrar mi aviso de pérdida cuando ya no necesite mantenerlo activo, para indicar que el aviso ha dejado de requerir seguimiento.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-005, US-007
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-009-AC-01:** El autor puede cerrar su propio aviso de pérdida cuando se encuentra Activo.
- **US-009-AC-02:** Al confirmar la operación, el aviso cambia a estado Cerrado y deja de estar disponible como aviso activo.
- **US-009-AC-03:** El usuario no puede cerrar avisos registrados por otra persona.
- **US-009-AC-04:** El sistema informa claramente cuando un aviso ya está cerrado o no puede cerrarse.

#### Verificación y restricciones

- Verificar la transición Activo → Cerrado y que no se permiten transiciones inversas desde esta funcionalidad.
- Verificar que la operación genera el evento de historial correspondiente.
- Cumplir D-06, R-05, R-07, R-08 y R-09.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Centralizar el registro de objetos perdidos y encontrados con información clara y organizada |
| Objetivo | G-01 — Registro y consulta de objetos |
| Alcance | S-02 — Gestión de objetos |
| Indicador | M-01 — Al menos 4 de 5 participantes completan el registro sin ayuda y en menos de 5 minutos |
| Estados relacionados | Objeto encontrado: Pendiente de entrega; aviso de pérdida: Activo → Cerrado |
| Restricciones | R-03, R-04, R-05, R-07, R-08 y R-11 |
| Decisiones | D-01, D-03 y D-06 |

