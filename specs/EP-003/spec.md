# EP-003 — Feed de solicitudes de búsqueda

## Épica

Como usuario autenticado de Lost&Found UEx, quiero publicar y consultar solicitudes sobre objetos que he perdido, para informar de lo que busco y facilitar que otras personas puedan reconocerlo.

- **Objetivos relacionados:** G-01
- **Alcance relacionado:** S-03 — Feed de solicitudes de búsqueda
- **Indicador relacionado:** M-02 — Usuarios que encuentran un objeto mediante búsqueda
- **Prioridad:** Must
- **Estimación:** 16 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** Release 1, Iteraciones 3 y 4

## Historias de usuario

### US-009 — Publicar una solicitud de búsqueda

Como usuario autenticado, quiero publicar una solicitud sobre un objeto que he perdido, para informar de sus características y facilitar que alguien pueda reconocerlo.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-009-AC-01:** El usuario autenticado puede iniciar una publicación de tipo solicitud de búsqueda.
- **US-009-AC-02:** El usuario puede indicar categoría, descripción, ubicación aproximada y fecha aproximada de la pérdida.
- **US-009-AC-03:** El usuario puede añadir información privada para identificar el objeto sin publicarla en el feed.
- **US-009-AC-04:** La solicitud se crea con estado Activa y queda asociada al usuario que la publicó.
- **US-009-AC-05:** El sistema valida los datos obligatorios antes de crear la solicitud.

#### Verificación y restricciones

- Verificar que al menos 4 de 5 participantes completan la publicación sin ayuda.
- Verificar que los datos privados no aparecen en el feed ni en respuestas públicas de la API.
- Cumplir R-03, R-04, R-05, R-08, R-09 y A-03.

### US-010 — Consultar el feed de solicitudes

Como usuario, quiero consultar las solicitudes de búsqueda activas, para comprobar si alguien ha encontrado un objeto parecido al que busco o identificar posibles necesidades de contacto.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-009
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-010-AC-01:** El usuario puede consultar un listado de solicitudes activas sin conocer su identificador.
- **US-010-AC-02:** Cada resultado muestra como mínimo categoría, descripción pública, ubicación aproximada, fecha y estado.
- **US-010-AC-03:** El feed no muestra información privada ni la dirección de correo del autor.
- **US-010-AC-04:** El sistema informa de forma comprensible cuando no hay solicitudes activas.

#### Verificación y restricciones

- Verificar que el feed solo muestra información pública y solicitudes activas.
- Verificar que los datos de demostración utilizados son ficticios o sintéticos.
- Cumplir R-03, R-05, R-08, R-09 y A-07.

### US-011 — Buscar y filtrar solicitudes

Como usuario, quiero buscar y filtrar las solicitudes de búsqueda, para localizar publicaciones relacionadas con el objeto que he encontrado o que estoy buscando.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-010
- **Plan inicial:** Release 1, Iteración 4

#### Criterios de aceptación

- **US-011-AC-01:** El usuario puede buscar solicitudes por texto en sus campos públicos.
- **US-011-AC-02:** El usuario puede filtrar por categoría, ubicación aproximada y estado.
- **US-011-AC-03:** Puede combinar varios filtros y eliminarlos para volver al feed completo.
- **US-011-AC-04:** La búsqueda no distingue entre mayúsculas y minúsculas.
- **US-011-AC-05:** El sistema informa de forma comprensible cuando no existen coincidencias.

#### Verificación y restricciones

- Verificar búsquedas con coincidencias, sin coincidencias, texto vacío y filtros combinados.
- Verificar que la búsqueda no utiliza datos privados.
- Cumplir R-03, R-04, R-08 y R-09.

### US-012 — Gestionar una solicitud propia

Como usuario que ha publicado una solicitud, quiero consultar su detalle, editarla o cerrarla, para mantener actualizada la información y dejar de buscar el objeto cuando el caso ya no esté activo.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-009
- **Plan inicial:** Release 1, Iteración 4

#### Criterios de aceptación

- **US-012-AC-01:** El autor puede consultar el detalle completo de su solicitud, incluida la información privada.
- **US-012-AC-02:** El autor puede editar su solicitud mientras permanezca Activa.
- **US-012-AC-03:** El sistema valida los datos modificados antes de guardarlos.
- **US-012-AC-04:** El autor puede cerrar su solicitud, que pasa de Activa a Cerrada y deja de aparecer en el feed activo.
- **US-012-AC-05:** Un usuario no puede editar ni cerrar solicitudes publicadas por otra persona.

#### Verificación y restricciones

- Verificar la edición y el cierre por el autor y el rechazo de esas operaciones para otros usuarios.
- Verificar que una solicitud cerrada no reaparece en el feed activo.
- Cumplir R-04, R-05, R-08, R-09 y D-06.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar que las personas comuniquen qué objetos han perdido y consulten posibles coincidencias |
| Objetivo | G-01 — Registro y consulta de objetos |
| Alcance | S-03 — Feed de solicitudes de búsqueda |
| Indicador | M-02 — Al menos 4 de 5 participantes localizan correctamente una publicación mediante búsqueda y filtros |
| Estado | Solicitud de búsqueda: Activa → Cerrada |
| Información pública | Categoría, descripción, ubicación aproximada, fecha y estado |
| Información privada | Datos identificativos aportados por el autor |
| Restricciones | R-03, R-04, R-05, R-08 y R-09 |
| Decisiones | D-02 y D-06 |
