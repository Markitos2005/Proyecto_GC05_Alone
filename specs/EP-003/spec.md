# EP-003 — Feed de solicitudes de búsqueda

## Épica

Como usuario autenticado de Lost&Found UEx, quiero publicar y consultar solicitudes sobre objetos que he perdido, para informar de lo que busco y facilitar que otras personas puedan reconocerlo.

- **Objetivos relacionados:** G-01
- **Alcance relacionado:** S-03 — Feed de solicitudes de búsqueda
- **Indicador relacionado:** M-02 — Usuarios que encuentran un objeto mediante búsqueda
- **Prioridad:** Must
- **Estimación:** 31 h-p (aprox. 4 semanas-persona a 8 h-p por semana)
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** IT-03

## Historias de usuario

### US-010 — Publicar una solicitud de búsqueda

Como usuario autenticado, quiero publicar una solicitud sobre un objeto que he perdido, para informar de sus características y facilitar que alguien pueda reconocerlo.

- **Prioridad:** Must
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-010-AC-01:** El usuario autenticado puede iniciar una publicación de tipo solicitud de búsqueda.
- **US-010-AC-02:** El usuario puede indicar categoría, descripción, ubicación aproximada y fecha aproximada de la pérdida.
- **US-010-AC-03:** El usuario puede añadir información privada para identificar el objeto sin publicarla en el feed.
- **US-010-AC-04:** La solicitud se crea con estado Activa y queda asociada al usuario que la publicó.
- **US-010-AC-05:** El sistema valida los datos obligatorios antes de crear la solicitud.

#### Verificación y restricciones

- Verificar que al menos 4 de 5 participantes completan la publicación sin ayuda.
- Verificar que los datos privados no aparecen en el feed ni en respuestas públicas de la API.
- Cumplir R-03, R-04, R-05, R-08, R-09 y A-03.

### US-011 — Consultar el feed de solicitudes

Como usuario, quiero consultar las solicitudes de búsqueda activas, para comprobar si alguien ha encontrado un objeto parecido al que busco o identificar posibles necesidades de contacto.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-010
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-011-AC-01:** El usuario puede consultar un listado de solicitudes activas sin conocer su identificador.
- **US-011-AC-02:** Cada resultado muestra como mínimo categoría, descripción pública, ubicación aproximada, fecha y estado.
- **US-011-AC-03:** El feed no muestra información privada ni la dirección de correo del autor.
- **US-011-AC-04:** El sistema informa de forma comprensible cuando no hay solicitudes activas.

#### Verificación y restricciones

- Verificar que el feed solo muestra información pública y solicitudes activas.
- Verificar que los datos de demostración utilizados son ficticios o sintéticos.
- Cumplir R-03, R-05, R-08, R-09 y A-07.

### US-012 — Buscar solicitudes por texto

Como usuario, quiero buscar y filtrar las solicitudes de búsqueda, para localizar publicaciones relacionadas con el objeto que he encontrado o que estoy buscando.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-011
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-012-AC-01:** El usuario puede buscar solicitudes por texto en sus campos públicos.
- **US-012-AC-02:** La búsqueda solo utiliza los campos públicos de la solicitud.
- **US-012-AC-03:** La búsqueda no distingue entre mayúsculas y minúsculas.
- **US-012-AC-04:** El sistema informa de forma comprensible cuando no existen coincidencias.

#### Verificación y restricciones

- Verificar búsquedas con coincidencias, sin coincidencias y texto vacío.
- Verificar que la búsqueda no utiliza datos privados.
- Cumplir R-03, R-04, R-08 y R-09.

### US-013 — Editar una solicitud propia

Como usuario que ha publicado una solicitud, quiero editar su información, para mantener actualizada la descripción del objeto que busco.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-010
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-013-AC-01:** El autor puede editar una solicitud propia mientras permanezca Activa.
- **US-013-AC-02:** El sistema valida los datos modificados antes de guardarlos.
- **US-013-AC-03:** La edición conserva el autor y el estado de la solicitud.
- **US-013-AC-04:** Un usuario no puede editar una solicitud publicada por otra persona.

#### Verificación y restricciones

- Verificar la edición por el autor y el rechazo de la operación para otros usuarios.
- Cumplir R-04, R-05, R-08, R-09 y D-06.

### US-019 — Filtrar solicitudes

Como usuario, quiero filtrar las solicitudes por categoría, ubicación y estado, para reducir los resultados relevantes sin consultar información privada.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-011
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-019-AC-01:** El usuario puede filtrar por categoría, ubicación aproximada y estado.
- **US-019-AC-02:** El usuario puede combinar varios filtros.
- **US-019-AC-03:** El usuario puede eliminar los filtros y recuperar el listado completo.
- **US-019-AC-04:** Los filtros solo se aplican sobre datos públicos.
- **US-019-AC-05:** El sistema informa de forma comprensible cuando no existen coincidencias.

#### Verificación y restricciones

- Verificar cada filtro por separado, la combinación de filtros y su limpieza.
- Verificar resultados vacíos y que nunca se usa información privada.
- Cumplir R-03, R-04, R-08 y R-09.

### US-020 — Cerrar una solicitud propia

Como usuario que ha publicado una solicitud, quiero cerrarla cuando ya no necesite encontrar el objeto, para que deje de aparecer entre las solicitudes activas.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-010
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-020-AC-01:** El autor puede cerrar una solicitud propia que esté Activa.
- **US-020-AC-02:** La solicitud pasa de Activa a Cerrada y deja de aparecer en el feed activo.
- **US-020-AC-03:** El sistema registra el cierre con fecha, usuario y motivo cuando proceda.
- **US-020-AC-04:** Un usuario no puede cerrar una solicitud publicada por otra persona.
- **US-020-AC-05:** Una solicitud Cerrada no puede cerrarse de nuevo mediante esta operación.

#### Verificación y restricciones

- Verificar la transición Activa → Cerrada y la desaparición del feed activo.
- Verificar el rechazo de la operación para otro usuario y para una solicitud ya cerrada.
- Cumplir R-05, R-07, R-08, R-09 y D-06.

### US-021 — Consultar el detalle de una solicitud

Como usuario, quiero consultar el detalle público de una solicitud, para valorar si mi hallazgo puede corresponder con el objeto buscado.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-011
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-021-AC-01:** El usuario puede abrir el detalle de una solicitud desde el feed o desde los resultados de búsqueda.
- **US-021-AC-02:** El detalle muestra categoría, descripción pública, ubicación aproximada, fecha y estado.
- **US-021-AC-03:** El detalle no muestra información privada ni la dirección de correo del autor.
- **US-021-AC-04:** Una solicitud Cerrada no se muestra como activa.

#### Verificación y restricciones

- Verificar el acceso al detalle desde el feed y desde una búsqueda.
- Verificar el aislamiento de la información privada y el estado mostrado.
- Cumplir R-03, R-05, R-08, R-09 y R-11.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar que las personas comuniquen qué objetos han perdido y consulten posibles coincidencias |
| Objetivo | G-01 — Registro y consulta de objetos |
| Alcance | S-03 — Feed de solicitudes de búsqueda |
| Indicador | M-02 — Al menos 4 de 5 participantes localizan correctamente una publicación mediante búsqueda y filtros |
| Historias | US-010, US-011, US-012, US-013, US-019, US-020 y US-021 |
| Estado | Solicitud de búsqueda: Activa → Cerrada |
| Información pública | Categoría, descripción, ubicación aproximada, fecha y estado |
| Información privada | Datos identificativos aportados por el autor |
| Restricciones | R-03, R-04, R-05, R-08 y R-09 |
| Decisiones | D-02 y D-06 |
