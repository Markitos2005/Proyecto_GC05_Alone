# EP-004 — Contacto y trazabilidad

## Épica

Como usuario autenticado de Lost&Found UEx, quiero iniciar un contacto por correo con el autor de un hallazgo o de una solicitud de búsqueda y consultar la trazabilidad de mis publicaciones y contactos, para acordar la recuperación del objeto fuera de la aplicación sin exponer datos innecesarios.

- **Objetivos relacionados:** G-02, G-03
- **Alcance relacionado:** S-04 — Contacto sobre una publicación; S-05 — Trazabilidad de publicaciones
- **Indicadores relacionados:** M-03 — Usuarios que completan un contacto; M-04 — Estados e historial correctamente reflejados
- **Prioridad:** Must
- **Estimación:** 31 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002, EP-003
- **Plan inicial:** IT-04

## Historias de usuario

### US-014 — Contactar sobre un hallazgo

Como usuario autenticado que ha perdido un objeto, quiero abrir un correo preconfigurado dirigido al autor de un hallazgo activo, para comunicarle que creo que el objeto es mío y aportar información que permita comprobarlo.

- **Prioridad:** Must
- **Estimación:** 6 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-002, US-007, US-010
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-014-AC-01:** El usuario autenticado puede iniciar el contacto desde el detalle de un hallazgo Activo publicado por otra persona.
- **US-014-AC-02:** El sistema no permite iniciar el contacto sobre un hallazgo propio, Devuelto o Retirado.
- **US-014-AC-03:** El usuario puede vincular opcionalmente una de sus solicitudes de búsqueda Activas y añadir un texto con información identificativa del objeto.
- **US-014-AC-04:** El sistema valida la longitud del texto añadido para que el enlace `mailto:` resultante pueda abrirse correctamente.
- **US-014-AC-05:** El sistema abre el cliente de correo predeterminado mediante un enlace `mailto:` con el destinatario, el asunto y el cuerpo preconfigurados.
- **US-014-AC-06:** El asunto incluye la referencia del hallazgo, y el cuerpo incluye la referencia de la solicitud vinculada cuando exista y el texto aportado por el usuario.
- **US-014-AC-07:** El mensaje no incluye los rasgos identificativos privados del hallazgo.
- **US-014-AC-08:** El sistema registra el contacto con estado `Iniciado`, la fecha, el usuario que lo inicia y el hallazgo relacionado.
- **US-014-AC-09:** La aplicación informa de que el contacto se ha iniciado, sin afirmar que el correo se haya enviado, recibido o leído.
- **US-014-AC-10:** La dirección de correo del autor solo se incorpora al enlace `mailto:` del usuario que inicia el contacto y no se muestra en el feed, en el detalle público ni en las respuestas públicas de la API.

#### Verificación y restricciones

- Verificar que el enlace `mailto:` contiene el destinatario, el asunto y el cuerpo esperados, con y sin solicitud vinculada.
- Verificar el rechazo del contacto sobre hallazgos propios, Devueltos y Retirados, y con textos que superan el límite.
- Verificar que el contacto queda registrado como `Iniciado` y que la aplicación no afirma que el correo se haya enviado.
- Verificar que la dirección del autor y los rasgos privados no aparecen en respuestas públicas de la API.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09, A-01 y D-05.

### US-015 — Contactar sobre una solicitud de búsqueda

Como usuario autenticado que ha encontrado un objeto, quiero abrir un correo preconfigurado dirigido al autor de una solicitud de búsqueda activa, para comunicarle que puedo tener el objeto que busca y acordar cómo comprobarlo.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-014, US-021
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-015-AC-01:** El usuario autenticado puede iniciar el contacto desde el detalle de una solicitud Activa publicada por otra persona.
- **US-015-AC-02:** El sistema no permite iniciar el contacto sobre una solicitud propia o Cerrada.
- **US-015-AC-03:** El usuario puede vincular opcionalmente uno de sus hallazgos Activos y añadir un texto que describa dónde y cuándo encontró el objeto.
- **US-015-AC-04:** El sistema abre el cliente de correo predeterminado mediante un enlace `mailto:` con el destinatario, el asunto con la referencia de la solicitud y el cuerpo preconfigurados.
- **US-015-AC-05:** El mensaje no incluye la información privada de la solicitud ni los rasgos identificativos privados del hallazgo vinculado.
- **US-015-AC-06:** El sistema registra el contacto con estado `Iniciado`, la fecha, el usuario que lo inicia y la solicitud relacionada.
- **US-015-AC-07:** La aplicación informa de que el contacto se ha iniciado, sin afirmar que el correo se haya enviado, recibido o leído.
- **US-015-AC-08:** La dirección de correo del autor de la solicitud no se muestra en el feed, en el detalle público ni en las respuestas públicas de la API.

#### Verificación y restricciones

- Verificar el enlace `mailto:` con y sin hallazgo vinculado.
- Verificar el rechazo del contacto sobre solicitudes propias y Cerradas.
- Verificar que la información privada de la solicitud y del hallazgo no aparece en el mensaje.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09 y D-05.

### US-027 — Elegir la información de contacto incluida

Como usuario autenticado, quiero elegir si mi teléfono se incluye en los correos de contacto y revisar el mensaje antes de abrirlo, para facilitar la recuperación sin exponer datos que no deseo compartir.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-004, US-014, US-015
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-027-AC-01:** El usuario puede indicar en su perfil si su teléfono se incluye por defecto en el cuerpo de los correos de contacto.
- **US-027-AC-02:** Antes de abrir el cliente de correo, la aplicación muestra una vista previa con el asunto y el cuerpo que se incorporarán.
- **US-027-AC-03:** Desde la vista previa, el usuario puede incluir o excluir el teléfono para ese contacto concreto.
- **US-027-AC-04:** Si el usuario no tiene teléfono en su perfil, la opción no se ofrece y el mensaje no incluye ningún teléfono.
- **US-027-AC-05:** El mensaje solo incluye la información autorizada por el usuario.
- **US-027-AC-06:** El cambio de preferencia se aplica a los nuevos contactos y no altera los contactos ya registrados.

#### Verificación y restricciones

- Verificar el correo con el teléfono incluido y excluido, con la preferencia por defecto y con el cambio puntual.
- Verificar el comportamiento cuando el perfil no tiene teléfono.
- Verificar que la preferencia no expone el teléfono en feeds, detalles públicos ni respuestas públicas de la API.
- Cumplir R-03, R-04, R-05, R-08, R-09, R-11 y D-05.

### US-026 — Consultar los contactos iniciados

Como usuario autenticado, quiero consultar los contactos que he iniciado y los que se han iniciado sobre mis publicaciones, para recordar qué coordinaciones están en curso sin asumir que los correos se hayan entregado.

- **Prioridad:** Should
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-014, US-015
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-026-AC-01:** El usuario puede consultar los contactos que ha iniciado sobre publicaciones de otras personas.
- **US-026-AC-02:** El usuario puede consultar los contactos iniciados por otras personas sobre sus propias publicaciones.
- **US-026-AC-03:** Cada contacto muestra la publicación relacionada, su estado actual, la fecha de inicio y el estado `Iniciado`.
- **US-026-AC-04:** Los contactos se muestran ordenados del más reciente al más antiguo.
- **US-026-AC-05:** El sistema no muestra estados de envío, recepción, lectura o respuesta que no pueda verificar.
- **US-026-AC-06:** Un contacto asociado a una publicación Devuelta, Retirada o Cerrada sigue disponible.
- **US-026-AC-07:** Un usuario no puede consultar contactos en los que no participa, ni desde la interfaz ni desde la API.
- **US-026-AC-08:** El sistema informa de forma comprensible cuando no existen contactos.

#### Verificación y restricciones

- Verificar la consulta con contactos iniciados y recibidos sobre varias publicaciones, incluidas publicaciones finalizadas.
- Verificar el aislamiento entre tres usuarios distintos y la ausencia de estados de correo no verificables.
- Cumplir D-05, D-08, R-05, R-07, R-08 y R-09.

### US-016 — Consultar el historial básico

Como usuario autenticado, quiero consultar el historial de cada una de mis publicaciones, para conocer las acciones realizadas y conservar la trazabilidad del caso sin que la aplicación certifique la entrega física.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-009, US-013, US-020, US-026
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-016-AC-01:** El autor puede consultar el historial de un hallazgo o una solicitud propia desde su detalle.
- **US-016-AC-02:** El historial incluye la creación, las ediciones, los cambios de estado y los contactos iniciados sobre la publicación.
- **US-016-AC-03:** Cada evento muestra la acción o el estado, la fecha, el usuario que la realizó y el motivo cuando proceda.
- **US-016-AC-04:** Los eventos se muestran en orden cronológico.
- **US-016-AC-05:** El historial se conserva cuando la publicación pasa a Devuelto, Retirado o Cerrada.
- **US-016-AC-06:** El usuario no puede modificar ni eliminar eventos del historial, ni desde la interfaz ni desde la API.
- **US-016-AC-07:** Un usuario no puede consultar el historial de publicaciones de otra persona.
- **US-016-AC-08:** El historial no certifica que el correo haya sido enviado, recibido o leído, ni que la entrega física se haya producido.

#### Verificación y restricciones

- Verificar que el historial refleja la creación, la edición, el cierre y el inicio de contacto en el orden correcto.
- Verificar que el historial se conserva tras finalizar la publicación.
- Verificar el aislamiento del historial entre dos usuarios distintos.
- Cumplir A-05, A-06, D-05, D-06, R-05, R-07, R-08 y R-09.

### US-023 — Reportar una publicación inapropiada

Como usuario autenticado, quiero reportar un hallazgo o una solicitud de búsqueda que considero inapropiada, falsa o que expone datos personales, para que la administración pueda revisarla y se mantenga la confianza en la aplicación.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-007, US-021
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-023-AC-01:** El usuario autenticado puede reportar desde su detalle un hallazgo o una solicitud publicada por otra persona.
- **US-023-AC-02:** El sistema no permite reportar una publicación propia.
- **US-023-AC-03:** El usuario debe seleccionar un motivo de una lista predefinida (contenido ofensivo, información personal expuesta, publicación falsa o fraudulenta, spam u otro) y puede añadir un comentario.
- **US-023-AC-04:** El sistema exige un comentario cuando el motivo seleccionado es "otro" y valida su longitud.
- **US-023-AC-05:** Un usuario no puede reportar la misma publicación mientras su reporte anterior siga Pendiente.
- **US-023-AC-06:** El reporte se crea con estado Pendiente y queda registrado con la fecha, el usuario que reporta, la publicación y el motivo.
- **US-023-AC-07:** Reportar una publicación no la oculta ni modifica su estado de forma automática.
- **US-023-AC-08:** El autor de la publicación no puede conocer la identidad de quien la ha reportado.
- **US-023-AC-09:** El usuario puede consultar los reportes que ha enviado y su estado.
- **US-023-AC-10:** La aplicación confirma de forma comprensible que el reporte se ha registrado.

#### Verificación y restricciones

- Verificar el reporte de un hallazgo y de una solicitud con cada motivo, con y sin comentario.
- Verificar el rechazo de reportes sobre publicaciones propias, duplicados pendientes y comentarios obligatorios ausentes.
- Verificar que la publicación reportada sigue visible y que la identidad del denunciante no se expone al autor ni en respuestas públicas de la API.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-04, R-05, R-07, R-08 y R-09.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar el contacto y la coordinación de la recuperación sin convertir la aplicación en un sistema de custodia |
| Objetivos | G-02 — Contacto para la recuperación; G-03 — Trazabilidad y confianza |
| Alcance | S-04 — Contacto sobre una publicación; S-05 — Trazabilidad de publicaciones |
| Indicadores | M-03 — Al menos 4 de 5 participantes completan correctamente un contacto; M-04 — El 100 % de las publicaciones de prueba reflejan su estado e historial básico y los contactos quedan registrados como iniciados |
| Historias | US-014, US-015, US-027, US-026, US-016 y US-023 |
| Estados | Contacto: `Iniciado` (estado único, no verificable más allá del inicio); reporte: Pendiente. Los estados de hallazgos y solicitudes se gestionan en US-009 y US-020 |
| Información privada | Dirección de correo y teléfono del autor, rasgos identificativos de hallazgos e información privada de solicitudes |
| Restricciones | R-03, R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-03, D-05, D-06, D-07 y D-08 |
