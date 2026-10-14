# EP-002 — Feed de hallazgos

## Épica

Como usuario autenticado de Lost&Found UEx, quiero publicar y consultar hallazgos de objetos, para informar a las personas que puedan estar buscándolos y facilitar el contacto posterior.

- **Objetivos relacionados:** G-01
- **Alcance relacionado:** S-02 — Feed de hallazgos
- **Indicador relacionado:** M-01 — Usuarios que completan el registro de un hallazgo
- **Prioridad:** Must
- **Estimación:** 16 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** Release 1, Iteraciones 2 y 3

## Historias de usuario

### US-005 — Publicar un hallazgo

Como usuario autenticado, quiero publicar un objeto encontrado, para informar de su existencia y permitir que otra persona pueda reconocerlo.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-005-AC-01:** El usuario autenticado puede iniciar una publicación de tipo hallazgo.
- **US-005-AC-02:** El usuario puede indicar categoría, descripción pública, ubicación aproximada, fecha del hallazgo y, cuando proceda, punto de entrega.
- **US-005-AC-03:** El usuario puede indicar rasgos identificativos privados que no se muestran en el feed público.
- **US-005-AC-04:** Al completar correctamente la publicación, el hallazgo se crea con estado Activo y queda asociado al usuario que lo publicó.
- **US-005-AC-05:** El sistema valida los datos obligatorios antes de crear la publicación y no la guarda si la validación falla.

#### Verificación y restricciones

- Verificar que al menos 4 de 5 participantes completan la publicación sin ayuda y en menos de 5 minutos.
- Verificar que la información pública y los rasgos privados se almacenan de forma separada.
- Cumplir R-03, R-04, R-05, R-08, R-09, A-03 y A-07.

### US-006 — Consultar el feed de hallazgos

Como usuario, quiero consultar un feed de hallazgos activos, para revisar si se ha encontrado un objeto que pueda corresponder a lo que busco.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-005
- **Plan inicial:** Release 1, Iteración 2

#### Criterios de aceptación

- **US-006-AC-01:** El usuario puede consultar un listado de hallazgos activos sin conocer su identificador.
- **US-006-AC-02:** Cada publicación muestra como mínimo la categoría, la descripción pública, la ubicación aproximada, la fecha y el estado.
- **US-006-AC-03:** El feed no muestra los rasgos identificativos privados ni la dirección de correo del autor.
- **US-006-AC-04:** El sistema informa de forma comprensible cuando no hay hallazgos activos.

#### Verificación y restricciones

- Verificar que el feed solo muestra información pública y hallazgos activos.
- Verificar que un usuario no autenticado solo puede consultar la información que el producto haya definido como pública.
- Cumplir R-03, R-05, R-08, R-09 y R-11.

### US-007 — Buscar y filtrar hallazgos

Como usuario, quiero buscar y filtrar el feed de hallazgos, para localizar publicaciones relacionadas con el objeto que estoy buscando.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-006
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-007-AC-01:** El usuario puede buscar hallazgos por texto en sus campos públicos.
- **US-007-AC-02:** El usuario puede filtrar por categoría, ubicación aproximada y estado.
- **US-007-AC-03:** Puede combinar varios filtros y eliminarlos para volver al feed completo.
- **US-007-AC-04:** La búsqueda no distingue entre mayúsculas y minúsculas.
- **US-007-AC-05:** El sistema informa de forma comprensible cuando no existen coincidencias.

#### Verificación y restricciones

- Verificar búsquedas con coincidencias, sin coincidencias, texto vacío y filtros combinados.
- Verificar que los rasgos privados nunca se utilizan como campos públicos de búsqueda.
- Cumplir R-03, R-04, R-08 y R-09.

### US-008 — Gestionar un hallazgo propio

Como usuario que ha publicado un hallazgo, quiero consultar su detalle, editarlo o cerrarlo, para mantener actualizada la información y dejar de mostrarlo cuando el caso ya no esté activo.

- **Prioridad:** Should
- **Estimación:** 3 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-005
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-008-AC-01:** El autor puede consultar el detalle completo de su hallazgo, incluidos sus rasgos identificativos privados.
- **US-008-AC-02:** El autor puede editar un hallazgo propio mientras permanezca Activo.
- **US-008-AC-03:** El sistema valida los datos modificados antes de guardarlos.
- **US-008-AC-04:** El autor puede cerrar su hallazgo, que pasa de Activo a Cerrado y deja de aparecer en el feed activo.
- **US-008-AC-05:** Un usuario no puede editar ni cerrar hallazgos publicados por otra persona.
- **US-008-AC-06:** El sistema informa de forma comprensible cuando el hallazgo ya está cerrado o la operación no está permitida.

#### Verificación y restricciones

- Verificar la edición y el cierre por el autor y el rechazo de las mismas operaciones para otro usuario.
- Verificar la transición Activo → Cerrado y que no se permite reactivar el hallazgo desde esta funcionalidad.
- Cumplir R-04, R-05, R-08, R-09 y D-06.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Centralizar la publicación y consulta de objetos encontrados |
| Objetivo | G-01 — Registro y consulta de objetos |
| Alcance | S-02 — Feed de hallazgos |
| Indicador | M-01 — Al menos 4 de 5 participantes completan el registro de un hallazgo sin ayuda y en menos de 5 minutos |
| Estado | Hallazgo: Activo → Cerrado |
| Información pública | Categoría, descripción pública, ubicación aproximada, fecha y estado |
| Información privada | Rasgos identificativos, visibles únicamente para el autor y bajo las reglas de acceso definidas |
| Restricciones | R-03, R-04, R-05, R-08 y R-09 |
