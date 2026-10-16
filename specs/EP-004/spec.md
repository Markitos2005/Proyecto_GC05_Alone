# EP-004 — Solicitudes de recuperación y trazabilidad

## Épica

Como usuario de Lost&Found UEx, quiero solicitar formalmente la recuperación de un hallazgo y conocer el resultado de la revisión, para recuperar mi objeto mediante un proceso controlado por el Conserje de la facultad correspondiente.

- **Objetivos relacionados:** G-03, G-05
- **Alcance relacionado:** S-04 — Solicitud y validación de recuperación
- **Indicadores relacionados:** M-03 — Solicitud de recuperación; M-05 — Roles y alcance
- **Prioridad:** Must
- **Estimación:** 31 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001, EP-002
- **Plan inicial:** IT-04

La recuperación formal comienza desde un hallazgo activo. La aplicación almacena la solicitud, permite su revisión por un Conserje de la facultad correspondiente y registra la decisión. Esta épica no gestiona la entrega física ni permite contacto directo entre Usuarios.

## Historias de usuario

### US-018 — Solicitar la recuperación de un hallazgo

Como Usuario autenticado, quiero solicitar la recuperación de un hallazgo aportando información que demuestre que el objeto es mío, para que el Conserje de la facultad pueda revisar mi solicitud.

- **Prioridad:** Must
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-009, US-010
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-018-AC-01:** El Usuario autenticado puede iniciar una solicitud desde el detalle de un hallazgo en estado `Activo`.
- **US-018-AC-02:** El formulario identifica el hallazgo seleccionado y permite aportar información adicional para demostrar la propiedad.
- **US-018-AC-03:** La información justificativa se almacena como privada y solo queda disponible para el Usuario y los Conserjes autorizados de la facultad del hallazgo.
- **US-018-AC-04:** El sistema impide crear una solicitud sin la información obligatoria o con datos que superen los límites establecidos.
- **US-018-AC-05:** Una solicitud creada correctamente queda asociada al Usuario y al hallazgo, con estado `Pendiente`.
- **US-018-AC-06:** El Usuario no puede crear otra solicitud `Pendiente` para el mismo hallazgo mientras exista una solicitud suya pendiente.
- **US-018-AC-07:** Crear una solicitud no cambia automáticamente el estado del hallazgo ni lo oculta del listado público.
- **US-018-AC-08:** El sistema informa del error y no guarda datos si el hallazgo no existe, no está `Activo` o la validación falla.

#### Verificación y restricciones

- Verificar una solicitud válida, campos obligatorios ausentes, datos excesivamente largos y hallazgos no activos.
- Verificar el aislamiento de la información justificativa frente a Usuarios no autorizados.
- Verificar el rechazo de solicitudes pendientes duplicadas para el mismo Usuario y hallazgo.
- Cumplir R-03, R-04, R-05, R-07, R-08, R-09, R-11 y D-07.

### US-019 — Consultar el estado de una solicitud propia

Como Usuario que ha enviado una solicitud de recuperación, quiero consultar su estado y la información de la decisión, para conocer si el Conserje la ha validado o rechazado.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-018
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-019-AC-01:** El Usuario puede consultar sus solicitudes de recuperación y ver el hallazgo relacionado, la fecha de creación y el estado.
- **US-019-AC-02:** El Usuario puede consultar el motivo de rechazo o las instrucciones de recogida cuando el Conserje las haya registrado.
- **US-019-AC-03:** El Usuario no puede consultar solicitudes, información justificativa ni decisiones de otras personas.
- **US-019-AC-04:** Una solicitud `Pendiente` no muestra una decisión que todavía no exista.
- **US-019-AC-05:** El sistema informa de forma comprensible cuando el Usuario no tiene solicitudes o la solicitud consultada no existe.
- **US-019-AC-06:** La consulta no permite al Usuario modificar el estado ni la decisión de una solicitud.

#### Verificación y restricciones

- Verificar consultas con solicitudes `Pendiente`, `Validada` y `Rechazada`.
- Verificar el aislamiento entre dos Usuarios y la ausencia de información privada ajena.
- Cumplir R-05, R-07, R-08, R-09 y R-11.

### US-020 — Notificar la decisión de recuperación

Como Usuario que ha solicitado una recuperación, quiero recibir un aviso cuando el Conserje valide o rechace mi solicitud, para conocer el resultado sin depender de un contacto externo.

- **Prioridad:** Must
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-012, US-018
- **Plan inicial:** IT-05

#### Criterios de aceptación

- **US-020-AC-01:** Cuando una solicitud pasa de `Pendiente` a `Validada` o `Rechazada`, el sistema genera un aviso dirigido al Usuario solicitante.
- **US-020-AC-02:** El aviso identifica la solicitud, el resultado y la fecha de la decisión.
- **US-020-AC-03:** El aviso incluye el motivo del rechazo o las instrucciones de recogida cuando el Conserje los haya indicado.
- **US-020-AC-04:** El sistema registra el aviso como `Emitido` sin afirmar que el Usuario lo haya leído.
- **US-020-AC-05:** No se genera un aviso de decisión si la operación no cambia el estado de la solicitud.
- **US-020-AC-06:** El aviso no expone la información justificativa privada ni datos de otros Usuarios.

#### Verificación y restricciones

- Verificar la generación de avisos para validación y rechazo, incluyendo motivos e instrucciones.
- Verificar que no se generan avisos duplicados ante reintentos o estados sin cambios.
- Verificar la privacidad del contenido del aviso y su estado `Emitido`.
- Cumplir R-07, R-08, R-09, R-11 y D-07.

### US-021 — Consultar el historial de recuperación

Como Usuario, Conserje o Administrador autorizado, quiero consultar el historial que corresponde a mi ámbito, para conocer las acciones realizadas y mantener la trazabilidad del proceso.

- **Prioridad:** Should
- **Estimación:** 7 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-018, US-020
- **Plan inicial:** IT-06

#### Criterios de aceptación

- **US-021-AC-01:** El sistema registra la creación de la solicitud, las consultas autorizadas, la decisión, el actor, la fecha y el cambio de estado.
- **US-021-AC-02:** El Usuario puede consultar únicamente el historial de sus propias solicitudes.
- **US-021-AC-03:** El Conserje puede consultar el historial de solicitudes asociadas a su facultad.
- **US-021-AC-04:** El Administrador puede consultar el historial conforme a sus permisos administrativos.
- **US-021-AC-05:** Cada registro identifica el estado anterior y posterior y conserva el motivo cuando corresponda.
- **US-021-AC-06:** El historial no permite alterar, borrar ni reabrir solicitudes o decisiones.
- **US-021-AC-07:** El sistema impide que un actor autorizado consulte información fuera de su ámbito.

#### Verificación y restricciones

- Verificar el historial completo de una solicitud `Pendiente → Validada` y de otra `Pendiente → Rechazada`.
- Verificar el aislamiento entre Usuarios, facultades y roles administrativos.
- Verificar que los registros permanecen disponibles después de una decisión y no pueden modificarse desde la consulta.
- Cumplir R-05, R-07, R-08, R-09, R-11 y D-04.

### US-022 — Reportar una publicación inapropiada

Como Usuario autenticado, quiero reportar un hallazgo o un aviso de pérdida que considere inapropiado, falso o expuesto de forma indebida, para que la Administración pueda revisarlo y mantener la confianza en la aplicación.

- **Prioridad:** Should
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-014, US-015
- **Plan inicial:** IT-06

#### Criterios de aceptación

- **US-022-AC-01:** El Usuario autenticado puede reportar desde el detalle un hallazgo o un aviso de pérdida publicado por otra persona.
- **US-022-AC-02:** El sistema no permite reportar una publicación propia.
- **US-022-AC-03:** El Usuario debe seleccionar un motivo predefinido y puede añadir un comentario.
- **US-022-AC-04:** El sistema exige un comentario cuando el motivo es `Otro` y valida su longitud.
- **US-022-AC-05:** El Usuario no puede crear otro reporte pendiente para la misma publicación.
- **US-022-AC-06:** El reporte se crea con estado `Pendiente` y registra publicación, motivo, autor del reporte y fecha.
- **US-022-AC-07:** Reportar una publicación no la oculta ni modifica automáticamente su estado.
- **US-022-AC-08:** La identidad del denunciante no se muestra al autor de la publicación ni en respuestas públicas.
- **US-022-AC-09:** El Usuario puede consultar los reportes que ha enviado y su estado.

#### Verificación y restricciones

- Verificar reportes de hallazgos y avisos con todos los motivos, comentarios válidos e inválidos y duplicados pendientes.
- Verificar que la publicación continúa visible y que la identidad del denunciante permanece protegida.
- Cumplir R-03, R-04, R-05, R-07, R-09 y R-11.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Permitir una recuperación formal y trazable sin convertir la aplicación en un sistema de custodia o contacto directo |
| Objetivos | G-03 — Recuperación validada; G-05 — Acceso y administración controlados |
| Alcance | S-04 — Solicitud y validación de recuperación |
| Indicadores | M-03 — Solicitud de recuperación; M-05 — Roles y alcance |
| Historias | US-018, US-019, US-020, US-021 y US-022 |
| Estados | Solicitud: `Pendiente → Validada` o `Pendiente → Rechazada`; aviso: `Emitido`; reporte: `Pendiente` |
| Información privada | Información justificativa, motivos de rechazo, instrucciones de recogida y datos restringidos |
| Separación funcional | Los avisos de pérdida de EP-003 no crean solicitudes ni participan en la validación |
| Entrega física | Se realiza fuera de la aplicación según las instrucciones del Conserje |
| Restricciones | R-03, R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-04, D-07, D-08, D-09 y D-11 |
