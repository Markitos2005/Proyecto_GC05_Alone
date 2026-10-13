# EP-003 — Búsqueda y consulta

## Épica

Como usuario de Lost&Found UEx, quiero consultar, buscar y filtrar los objetos registrados, para localizar rápidamente información relevante sobre objetos perdidos o encontrados y conocer su estado.

- **Objetivos relacionados:** G-01
- **Alcance relacionado:** S-03 — Búsqueda y consulta
- **Indicador relacionado:** M-02 — Usuarios que encuentran un objeto mediante búsqueda
- **Prioridad:** Must
- **Estimación:** 16 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-002
- **Plan inicial:** Release 1, Iteración 3

## Historias de usuario

### US-010 — Consultar objetos registrados

Como usuario, quiero consultar los objetos registrados en la aplicación, para conocer qué objetos perdidos o encontrados están disponibles.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-005, US-006
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-010-AC-01:** El usuario puede acceder a un listado de objetos registrados sin necesidad de conocer su identificador.
- **US-010-AC-02:** Cada resultado muestra como mínimo el tipo de aviso, la categoría, la ubicación, la fecha y el estado del objeto.
- **US-010-AC-03:** El listado solo incluye información pública y no muestra los rasgos identificativos ocultos.
- **US-010-AC-04:** El sistema informa de forma comprensible cuando no existen objetos que mostrar.

#### Verificación y restricciones

- Verificar que el listado contiene objetos perdidos y encontrados con información ficticia o sintética.
- Verificar que los rasgos identificativos no aparecen ni en la interfaz ni en las respuestas de la API para usuarios no autorizados.
- Cumplir R-03, R-05, R-08, R-09 y R-11.

### US-011 — Buscar objetos por texto

Como usuario, quiero buscar objetos mediante texto, para localizar avisos relacionados con una descripción o categoría concreta.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-010
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-011-AC-01:** El usuario puede introducir un texto de búsqueda y ejecutar la consulta.
- **US-011-AC-02:** La búsqueda devuelve los objetos cuyos campos de información pública sean relevantes para el texto introducido.
- **US-011-AC-03:** La búsqueda no distingue entre mayúsculas y minúsculas.
- **US-011-AC-04:** El sistema informa de forma comprensible cuando no encuentra coincidencias.
- **US-011-AC-05:** El texto de búsqueda se valida y procesa sin permitir entradas inválidas o no autorizadas.

#### Verificación y restricciones

- Verificar búsquedas con coincidencias, sin coincidencias, texto vacío y distintas combinaciones de mayúsculas y minúsculas.
- Verificar que la búsqueda no utiliza ni expone los rasgos identificativos ocultos.
- Cumplir R-03, R-04, R-08, R-09 y R-11.

### US-012 — Filtrar objetos por categoría y ubicación

Como usuario, quiero filtrar los objetos por categoría y ubicación, para reducir los resultados y encontrar aquellos que coincidan con el contexto en el que se perdió o encontró el objeto.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-010
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-012-AC-01:** El usuario puede seleccionar una categoría y consultar únicamente los objetos asociados a ella.
- **US-012-AC-02:** El usuario puede seleccionar una ubicación y consultar únicamente los objetos asociados a ella.
- **US-012-AC-03:** El usuario puede combinar los filtros de categoría y ubicación.
- **US-012-AC-04:** El sistema permite eliminar los filtros aplicados y volver al listado correspondiente.
- **US-012-AC-05:** Las categorías y ubicaciones disponibles proceden de los valores válidos configurados en el sistema.

#### Verificación y restricciones

- Verificar cada filtro por separado y la combinación de ambos con datos de demostración.
- Verificar que un valor inexistente o no válido no produce resultados incorrectos ni modifica los datos.
- Cumplir R-04, R-08, R-09 y A-04.

### US-013 — Filtrar objetos por estado

Como usuario, quiero filtrar los objetos por estado, para distinguir los avisos activos de los objetos encontrados que todavía están disponibles, en reclamación o devueltos.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-010
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-013-AC-01:** El usuario puede filtrar los resultados por los estados válidos del tipo de objeto consultado.
- **US-013-AC-02:** El sistema no permite seleccionar estados que no correspondan al tipo de registro.
- **US-013-AC-03:** Los resultados muestran únicamente objetos cuyo estado actual coincide con el filtro.
- **US-013-AC-04:** El estado mostrado en cada resultado es el estado actual almacenado por el sistema.

#### Verificación y restricciones

- Verificar los estados Activo y Cerrado para avisos de pérdida y Pendiente de entrega, Disponible, En reclamación y Devuelto para objetos encontrados.
- Verificar que los filtros reflejan correctamente los cambios de estado registrados.
- Cumplir R-04, R-07, R-08 y R-09.

### US-014 — Consultar el detalle público de un objeto

Como usuario, quiero consultar el detalle público de un objeto, para comprobar si puede corresponder al objeto que he perdido o encontrado sin acceder a información reservada.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-010
- **Plan inicial:** Release 1, Iteración 3

#### Criterios de aceptación

- **US-014-AC-01:** El usuario puede abrir el detalle de un objeto desde el listado o mediante una referencia válida.
- **US-014-AC-02:** El detalle público incluye la categoría, la ubicación, la fecha, el tipo de registro, el estado y la descripción genérica.
- **US-014-AC-03:** El detalle público no incluye los rasgos identificativos ocultos del objeto encontrado.
- **US-014-AC-04:** Una referencia inexistente o no disponible produce un mensaje comprensible y no revela información privada.
- **US-014-AC-05:** La API aplica la misma separación entre información pública y reservada que la interfaz.

#### Verificación y restricciones

- Verificar el detalle de avisos de pérdida y objetos encontrados en cada estado definido.
- Verificar mediante pruebas de autorización que los rasgos identificativos solo son accesibles para responsables y administradores.
- Cumplir D-01, R-05, R-07, R-08, R-09 y R-11.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Proporcionar un punto centralizado y organizado para localizar objetos perdidos y encontrados |
| Objetivo | G-01 — Registro y consulta de objetos |
| Alcance | S-03 — Búsqueda y consulta |
| Indicador | M-02 — Al menos 4 de 5 participantes localizan correctamente un objeto concreto mediante los filtros disponibles |
| Información pública | Categoría, ubicación, fecha y descripción genérica |
| Restricciones | R-03, R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-01 y D-02 |

