# EP-004 — Contacto y trazabilidad

## Épica

Como usuario autenticado de Lost&Found UEx, quiero iniciar un contacto por correo con el autor de un hallazgo, para comunicar que busco ese objeto y acordar su recuperación fuera de la aplicación.

- **Objetivos relacionados:** G-02, G-03
- **Alcance relacionado:** S-04 — Contacto sobre un hallazgo; S-05 — Cierre y trazabilidad de publicaciones; R-07 — Trazabilidad
- **Indicadores relacionados:** M-03 — Usuarios que contactan sobre un hallazgo; M-04 — Estados correctamente reflejados
- **Prioridad:** Must
- **Estimación:** 24 h-p (aprox. 3 semanas-persona a 8 h-p por semana)
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002, EP-003
- **Plan inicial:** IT-04

## Historias de usuario

### US-014 — Contactar sobre un hallazgo

Como usuario autenticado, quiero abrir un correo preconfigurado asociado a un hallazgo activo, para comunicar al autor que busco ese objeto y aportar información que ayude a identificarlo.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-007, US-010
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-014-AC-01:** El usuario autenticado puede iniciar el contacto desde el detalle de un hallazgo activo.
- **US-014-AC-02:** El usuario puede indicar la referencia de su solicitud de búsqueda y aportar información adicional sobre el objeto que busca.
- **US-014-AC-03:** El sistema abre el cliente de correo predeterminado mediante un enlace `mailto:` con el destinatario, asunto y contenido preconfigurados.
- **US-014-AC-04:** El mensaje incluye una referencia del hallazgo y suficiente información para que el autor pueda identificar el contexto del contacto.
- **US-014-AC-05:** La aplicación informa de que el contacto se ha iniciado, sin afirmar que el correo se haya enviado o leído.
- **US-014-AC-06:** La dirección de correo del autor se muestra únicamente al usuario que inicia el contacto y no se publica en el feed.

#### Verificación y restricciones

- Verificar que el enlace `mailto:` contiene el destinatario, asunto y contenido esperados.
- Verificar que el sistema no afirma que el correo se haya enviado cuando la aplicación no puede confirmarlo.
- Verificar la validación del contenido y la referencia del hallazgo.
- Cumplir R-03, R-04, R-05, R-08, R-09, A-01 y D-05.

### US-015 — Contactar sobre una pérdida

Como usuario autenticado, quiero comunicar la posesión de un objeto cuando una solicitud de recuperación se corresponda con la descripción de dicho objeto.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-009, US-020
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-015-AC-01:** El autor puede marcar como Devuelto o Retirado un hallazgo Activo propio, o cerrar una solicitud Activa propia.
- **US-015-AC-02:** Al finalizar una publicación, el hallazgo pasa a Devuelto o Retirado, la solicitud pasa a Cerrada y la publicación deja de aparecer en el feed activo.
- **US-015-AC-03:** El sistema registra el cierre con la fecha, el usuario y el motivo cuando proceda.
- **US-015-AC-04:** Un usuario no puede cerrar ni modificar publicaciones de otra persona.
- **US-015-AC-05:** El cierre de una publicación no elimina su información histórica ni los contactos asociados.

#### Verificación y restricciones

- Verificar las transiciones Activo → Devuelto/Retirado de hallazgos y Activa → Cerrada de solicitudes propias.
- Verificar que una publicación cerrada no aparece en los feeds activos y que sus datos históricos se conservan.
- Cumplir D-06, R-05, R-07, R-08 y R-09.

### US-016 — Consultar el historial básico

Como usuario autenticado, quiero consultar el historial básico de mis publicaciones y contactos, para conocer las acciones realizadas y conservar la trazabilidad del caso sin que la aplicación certifique la entrega física.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-014, US-015
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-016-AC-01:** El autor puede consultar el historial básico de sus hallazgos y solicitudes de búsqueda.
- **US-016-AC-02:** El historial puede incluir la creación, edición y cierre de la publicación, así como el inicio de contactos asociados.
- **US-016-AC-03:** Cada evento muestra como mínimo la acción o estado, la fecha y el usuario que la realizó.
- **US-016-AC-04:** El usuario no puede modificar ni eliminar eventos del historial.
- **US-016-AC-05:** Un usuario no puede consultar el historial privado de publicaciones o contactos de otra persona.
- **US-016-AC-06:** El historial no certifica que el correo haya sido enviado, recibido o leído, ni que la entrega física se haya producido.

#### Verificación y restricciones

- Verificar que el historial refleja la creación, edición, cierre e inicio de contacto en el orden correcto.
- Verificar el aislamiento del historial entre dos usuarios distintos.
- Verificar que cerrar una publicación no elimina su historial.
- Cumplir A-05, A-06, D-05, D-06, R-05, R-07, R-08 y R-09.

### US-026 — Consultar los contactos iniciados

Como usuario autenticado, quiero consultar los contactos que he iniciado sobre mis publicaciones, para recordar con quién he intentado coordinar la recuperación sin asumir que el correo haya sido entregado.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-014, US-016
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-026-AC-01:** El usuario puede consultar los contactos iniciados desde sus hallazgos y solicitudes relacionadas.
- **US-026-AC-02:** Cada contacto muestra la publicación relacionada, la fecha de inicio y el estado `Iniciado`.
- **US-026-AC-03:** El sistema no muestra estados de envío, recepción, lectura o respuesta que no pueda verificar.
- **US-026-AC-04:** Un usuario no puede consultar los contactos privados iniciados por otra persona.
- **US-026-AC-05:** Un contacto asociado a una publicación finalizada permanece disponible en el historial.

#### Verificación y restricciones

- Verificar la consulta con contactos de varias publicaciones y con publicaciones finalizadas.
- Verificar el aislamiento entre dos usuarios y la ausencia de estados de correo no verificables.
- Cumplir D-05, D-08, R-05, R-07, R-08 y R-09.

### US-027 — Gestionar la información de contacto visible

Como usuario, quiero controlar qué información de contacto se incluye en mis comunicaciones, para facilitar la recuperación sin exponer datos innecesarios.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-004, US-014
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-027-AC-01:** El usuario puede seleccionar si su teléfono de perfil se incluye en el cuerpo del correo `mailto:`.
- **US-027-AC-02:** La aplicación incluye únicamente la información autorizada por el usuario en el mensaje preconfigurado.
- **US-027-AC-03:** La dirección del destinatario no se publica en feeds ni detalles públicos.
- **US-027-AC-04:** El cambio de preferencia se aplica a los nuevos contactos y no altera los contactos históricos.
- **US-027-AC-05:** La aplicación informa al usuario de qué información se incorporará antes de abrir el cliente de correo.

#### Verificación y restricciones

- Verificar el correo con el teléfono incluido y excluido, y comprobar la vista previa del contenido.
- Verificar que la preferencia no modifica datos ya registrados ni expone información a otros usuarios.
- Cumplir R-03, R-04, R-05, R-08, R-09, R-11 y D-05.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar el contacto y la coordinación de la recuperación sin convertir la aplicación en un sistema de custodia |
| Objetivos | G-02 — Contacto para la recuperación; G-03 — Trazabilidad y confianza |
| Alcance | S-04, S-05 y R-07 |
| Historias | US-014, US-015, US-016, US-026 y US-027 |
| Indicadores | M-03 — Al menos 4 de 5 participantes completan correctamente un contacto; M-04 — El 100 % de las publicaciones de prueba reflejan su estado e historial básico y los contactos quedan registrados como iniciados |
| Estados | Hallazgo: Activo → Devuelto/Retirado; solicitud: Activa → Cerrada; el contacto queda registrado únicamente como iniciado |
| Restricciones | R-03, R-04, R-05, R-07, R-08 y R-09 |
| Decisiones | D-03, D-05, D-06, D-07 y D-08 |
