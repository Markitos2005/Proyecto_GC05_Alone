# EP-002 — Gestión y exploración de objetos encontrados

## Épica

Como usuario de Lost&Found UEx, quiero publicar, explorar y gestionar objetos encontrados, para facilitar que sus propietarios los identifiquen y puedan iniciar el contacto para recuperarlos.

- **Objetivos relacionados:** G-01, G-02
- **Alcance relacionado:** S-02 — Feed de hallazgos
- **Indicadores relacionados:** M-01 — Usuarios que completan el registro de un hallazgo; M-02 — Usuarios que encuentran un objeto mediante búsqueda
- **Prioridad:** Must
- **Estimación:** 41 h-p 
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** IT-02 e IT-03

## Historias de usuario

### US-006 — Publicar un hallazgo con imágenes, categorías y geolocalización

Como usuario autenticado, quiero publicar un objeto encontrado con imágenes, una categoría y una ubicación geográfica, para aportar información suficiente que facilite su identificación.

- **Prioridad:** Must
- **Estimación:** 14 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-003, US-005
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-006-AC-01:** El usuario autenticado puede iniciar una publicación de tipo hallazgo.
- **US-006-AC-02:** El usuario puede seleccionar una categoría válida y aportar descripción pública, fecha del hallazgo y, cuando proceda, punto de entrega.
- **US-006-AC-03:** El usuario puede indicar una ubicación mediante coordenadas geográficas válidas o la interfaz de localización definida por el producto.
- **US-006-AC-04:** El usuario puede adjuntar una o más imágenes en los formatos y límites de tamaño establecidos.
- **US-006-AC-05:** El usuario puede añadir rasgos identificativos privados que no se muestran en el feed público.
- **US-006-AC-06:** Al completar correctamente la publicación, el hallazgo se crea con estado Activo y queda asociado al usuario que lo publicó.
- **US-006-AC-07:** El sistema valida los campos obligatorios, la categoría, la ubicación y las imágenes antes de guardar la publicación.
- **US-006-AC-08:** Si una validación falla, el sistema informa del error y no guarda una publicación incompleta.

#### Verificación y restricciones

- Verificar la publicación con categoría, ubicación e imágenes válidas y rechazar formatos, tamaños o coordenadas inválidos.
- Verificar que la información pública y los rasgos privados se almacenan y muestran de forma separada.
- Cumplir R-03, R-04, R-05, R-08, R-09, A-03 y A-07.

### US-007 — Consultar y explorar el feed público de hallazgos

Como usuario, quiero consultar y explorar un feed público paginado de objetos encontrados, para revisar hallazgos activos.

- **Prioridad:** Must
- **Estimación:** 10 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-006
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-007-AC-01:** El usuario puede consultar un listado paginado de hallazgos Activos.
- **US-007-AC-02:** La respuesta permite avanzar y retroceder entre páginas sin duplicar ni perder resultados.
- **US-007-AC-03:** Cada resultado muestra como mínimo categoría, descripción pública, ubicación permitida, fecha, estado e imágenes públicas cuando existan.
- **US-007-AC-04:** El feed no muestra rasgos identificativos privados ni la dirección de correo del autor.
- **US-007-AC-05:** El sistema informa de forma comprensible cuando no hay hallazgos activos o no existe la página solicitada.

#### Verificación y restricciones

- Verificar paginación con cero, uno y varios bloques de resultados, incluidos los límites de primera y última página.
- Verificar que solo se expone información pública y que los datos ficticios son sintéticos.
- Cumplir R-03, R-05, R-08, R-09 y R-11.

### US-008 — Filtrar hallazgos por fecha, categoría y proximidad

Como usuario, quiero filtrar los hallazgos por fechas, categorías, para localizar publicaciones relevantes para mi búsqueda.

- **Prioridad:** Should
- **Estimación:** 7 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-007
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-008-AC-01:** El usuario puede filtrar por fecha o intervalo de fechas del hallazgo.
- **US-008-AC-02:** El usuario puede filtrar por una o varias categorías.
- **US-008-AC-03:** El usuario puede indicar una ubicación de referencia y un radio de proximidad válido.
- **US-008-AC-04:** El sistema devuelve únicamente hallazgos que cumplen simultáneamente los filtros aplicados.
- **US-008-AC-05:** El usuario puede combinar, limpiar y modificar los filtros sin salir del feed.
- **US-008-AC-06:** Los filtros se aplican únicamente sobre información pública y no sobre rasgos privados.
- **US-008-AC-07:** El sistema informa de forma comprensible cuando no existen coincidencias o los parámetros son inválidos.

#### Verificación y restricciones

- Verificar filtros por separado, combinados, sin resultados, con fechas límite y con radios válidos e inválidos.
- Verificar que el cálculo de proximidad no expone coordenadas privadas innecesarias.
- Cumplir R-03, R-04, R-08, R-09 y R-11.

### US-009 — Gestionar un hallazgo propio

Como usuario que ha publicado un hallazgo, quiero editar sus datos, marcarlo como devuelto o retirarlo, para mantener actualizada la publicación y reflejar la situación del objeto.

- **Prioridad:** Should
- **Estimación:** 10 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-006
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-009-AC-01:** El autor puede consultar el detalle completo de su hallazgo, incluidas sus imágenes y rasgos identificativos privados.
- **US-009-AC-02:** El autor puede editar los datos permitidos de un hallazgo propio mientras permanezca Activo.
- **US-009-AC-03:** El sistema valida los datos modificados antes de guardarlos y conserva el autor de la publicación.
- **US-009-AC-04:** El autor puede marcar un hallazgo Activo como Devuelto cuando el objeto haya sido entregado a su propietario.
- **US-009-AC-05:** El autor puede retirar un hallazgo Activo, que pasa a estado Retirado y deja de aparecer en el feed público.
- **US-009-AC-06:** Un hallazgo Devuelto o Retirado no puede volver a publicarse como Activo mediante esta funcionalidad.
- **US-009-AC-07:** Un usuario no puede editar, marcar como Devuelto ni retirar un hallazgo de otra persona.
- **US-009-AC-08:** El sistema registra el cambio de estado con fecha, usuario y motivo cuando proceda.

#### Verificación y restricciones

- Verificar edición, transición `Activo → Devuelto`, transición `Activo → Retirado` y rechazo de operaciones por otros usuarios.
- Verificar que los hallazgos Devueltos y Retirados no aparecen en el feed público y conservan su historial.
- Cumplir R-04, R-05, R-07, R-08, R-09 y D-06.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Centralizar la publicación y exploración de objetos encontrados |
| Objetivos | G-01 — Registro y consulta de objetos; G-02 — Contacto para la recuperación |
| Alcance | S-02 — Feed de hallazgos |
| Indicadores | M-01 — Registro de un hallazgo; M-02 — Localización de publicaciones mediante búsqueda y filtros |
| Historias | US-006, US-007, US-008 y US-009 |
| Estados | Hallazgo: Activo → Devuelto o Retirado |
| Información pública | Categoría, descripción pública, ubicación permitida, fecha, imágenes públicas y estado |
| Información privada | Rasgos identificativos y datos restringidos del hallazgo |
| Restricciones | R-03, R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-02, D-06, D-07 y D-08 |
