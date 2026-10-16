# EP-002 — Gestión y exploración de objetos perdidos

## Épica

Como conserje, quiero publicar, explorar y gestionar objetos encontrados o depositados en conserjería, para facilitar que sus propietarios los identifiquen y puedan iniciar el contacto para recuperarlos.

- **Objetivos relacionados:** G-01, G-02
- **Alcance relacionado:** S-02 — Feed de hallazgos
- **Indicadores relacionados:** M-01 — Usuarios que completan el registro de un hallazgo; M-02 — Usuarios que encuentran un objeto mediante búsqueda
- **Prioridad:** Must
- **Estimación:** 46 h-p 
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** IT-02 e IT-03

## Historias de usuario

### US-008 — Publicar un hallazgo con imágenes, categoría y descripción básica del objeto

Como conserje de la UEX autenticado en el sistema, quiero publicar un objeto encontrado con imágenes, una categoría y una ubicación geográfica, para aportar información suficiente que facilite su identificación.

- **Prioridad:** Must
- **Estimación:** 14 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-003, US-005
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-008-AC-01:** El usuario autenticado puede iniciar una publicación de tipo hallazgo.
- **US-008-AC-02:** El usuario puede seleccionar una categoría válida y aportar descripción pública, fecha del hallazgo y, cuando proceda, punto de entrega.
- **US-008-AC-03:** El usuario puede indicar una ubicación mediante coordenadas geográficas válidas o la interfaz de localización definida por el producto.
- **US-008-AC-04:** El usuario puede adjuntar una o más imágenes en los formatos y límites de tamaño establecidos.
- **US-008-AC-05:** El usuario puede añadir rasgos identificativos privados que no se muestran en el feed público.
- **US-008-AC-06:** Al completar correctamente la publicación, el hallazgo se crea con estado Activo y queda asociado al usuario que lo publicó.
- **US-008-AC-07:** El sistema valida los campos obligatorios, la categoría, la ubicación y las imágenes antes de guardar la publicación.
- **US-008-AC-08:** Si una validación falla, el sistema informa del error y no guarda una publicación incompleta.

#### Verificación y restricciones

- Verificar la publicación con categoría, ubicación e imágenes válidas y rechazar formatos, tamaños o coordenadas inválidos.
- Verificar que la información pública y los rasgos privados se almacenan y muestran de forma separada.
- Cumplir R-03, R-04, R-05, R-08, R-09, A-03 y A-07.

### US-009 — Búsqueda de objeto perdido

Como usuario de Lost&Found UEx, quiero rellenar un formulario sencillo indicando la categoría, facultad y los detalles básicos del objeto perdido, y ver a partir de esta información objetos perdidos que coincidan con la descripción aportada.

- **Prioridad:** Must
- **Estimación:** 10 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-008
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-009-AC-01:** El usuario puede consultar un listado paginado de hallazgos Activos.
- **US-009-AC-02:** La respuesta permite avanzar y retroceder entre páginas sin duplicar ni perder resultados.
- **US-009-AC-03:** Cada resultado muestra como mínimo categoría, descripción pública, ubicación permitida, fecha, estado e imágenes públicas cuando existan.
- **US-009-AC-04:** El feed no muestra rasgos identificativos privados ni la dirección de correo del autor.
- **US-009-AC-05:** El sistema informa de forma comprensible cuando no hay hallazgos activos o no existe la página solicitada.

#### Verificación y restricciones

- Verificar paginación con cero, uno y varios bloques de resultados, incluidos los límites de primera y última página.
- Verificar que solo se expone información pública y que los datos ficticios son sintéticos.
- Cumplir R-03, R-05, R-08, R-09 y R-11.


### US-010 — Gestionar un hallazgo propio

Como conserje que ha publicado un hallazgo, quiero editar sus datos, marcarlo como devuelto o retirarlo, para mantener actualizada la publicación y reflejar la situación del objeto.

- **Prioridad:** Should
- **Estimación:** 10 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-008
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-010-AC-01:** El autor puede consultar el detalle completo de su hallazgo, incluidas sus imágenes y rasgos identificativos privados.
- **US-010-AC-02:** El autor puede editar los datos permitidos de un hallazgo propio mientras permanezca Activo.
- **US-010-AC-03:** El sistema valida los datos modificados antes de guardarlos y conserva el autor de la publicación.
- **US-010-AC-04:** El autor puede marcar un hallazgo Activo como Devuelto cuando el objeto haya sido entregado a su propietario.
- **US-010-AC-05:** El autor puede retirar un hallazgo Activo, que pasa a estado Retirado y deja de aparecer en el feed público.
- **US-010-AC-06:** Un hallazgo Devuelto o Retirado no puede volver a publicarse como Activo mediante esta funcionalidad.
- **US-010-AC-07:** Un usuario no puede editar, marcar como Devuelto ni retirar un hallazgo de otra persona.
- **US-010-AC-08:** El sistema registra el cambio de estado con fecha, usuario y motivo cuando proceda.

#### Verificación y restricciones

- Verificar edición, transición `Activo → Devuelto`, transición `Activo → Retirado` y rechazo de operaciones por otros usuarios.
- Verificar que los hallazgos Devueltos y Retirados no aparecen en el feed público y conservan su historial.
- Cumplir R-04, R-05, R-07, R-08, R-09 y D-06.

### US-011 — Revisión y validación de solicitudes de recuperación

Como conserje asignado a la facultad de un hallazgo, quiero revisar y validar o rechazar las solicitudes de recuperación asociadas a ese hallazgo, con la información aportada por el usuario, para decidir si la solicitud procede y comunicar el resultado.

- **Prioridad:** Should
- **Estimación:** 12 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-009, US-010
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-011-AC-01:** El Conserje puede consultar únicamente las solicitudes de recuperación en estado `Pendiente` asociadas a hallazgos de su facultad asignada.
- **US-011-AC-02:** Cada solicitud muestra el hallazgo relacionado y la información aportada por el Usuario para demostrar la propiedad, sin exponerla en listados o vistas públicas.
- **US-011-AC-03:** El Conserje puede revisar el detalle de una solicitud sin modificar los datos aportados por el Usuario ni los rasgos identificativos privados del hallazgo.
- **US-011-AC-04:** El Conserje puede validar una solicitud `Pendiente`; al hacerlo, la solicitud pasa a `Validada` y el hallazgo relacionado puede pasar a `Devuelto` cuando se complete la entrega.
- **US-011-AC-05:** El Conserje puede rechazar una solicitud `Pendiente` e indicar un motivo comprensible; al hacerlo, la solicitud pasa a `Rechazada`.
- **US-011-AC-06:** Una solicitud `Validada` o `Rechazada` no puede volver a `Pendiente` ni recibir una segunda decisión mediante esta funcionalidad.
- **US-011-AC-07:** Después de validar o rechazar una solicitud, el sistema registra un aviso dirigido al Usuario con el resultado y, cuando corresponda, el motivo o las instrucciones de recogida definidas por el Conserje.
- **US-011-AC-08:** Cada decisión registra la solicitud afectada, el Conserje que la toma, la fecha, el estado anterior, el estado nuevo y el motivo cuando exista.
- **US-011-AC-09:** Un Usuario, un Conserje de otra facultad o cualquier cuenta sin permisos no puede consultar la información privada ni validar o rechazar la solicitud.
- **US-011-AC-10:** Si la solicitud no existe, ya no está `Pendiente` o los datos de la decisión no son válidos, el sistema informa del error y no modifica la solicitud.

#### Verificación y restricciones

- Verificar la consulta de solicitudes por facultad con solicitudes pendientes de la facultad propia, de otra facultad y sin solicitudes.
- Verificar la separación entre información pública del hallazgo e información privada de la solicitud y del hallazgo.
- Verificar las transiciones `Pendiente → Validada` y `Pendiente → Rechazada`, incluido el motivo obligatorio al rechazar.
- Verificar que se genera un aviso al Usuario y que se conserva la trazabilidad de cada decisión.
- Verificar el rechazo de accesos y decisiones por Usuarios, Conserjes de otra facultad y cuentas sin permisos.
- Cumplir G-03, S-04, R-04, R-05, R-07, R-08, R-09, R-11 y las decisiones D-04, D-07 y D-08.


## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Centralizar la publicación y exploración de objetos encontrados |
| Objetivos | G-01 — Registro y consulta de objetos; G-02 — Contacto para la recuperación |
| Alcance | S-02 — Feed de hallazgos |
| Indicadores | M-01 — Registro de un hallazgo; M-02 — Localización de publicaciones mediante búsqueda y filtros |
| Historias | US-008, US-009, US-010 y US-011 |
| Estados | Hallazgo: Activo → Devuelto o Retirado |
| Información pública | Categoría, descripción pública, ubicación permitida, fecha, imágenes públicas y estado |
| Información privada | Rasgos identificativos y datos restringidos del hallazgo |
| Restricciones | R-03, R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-02, D-06, D-07 y D-08 |
