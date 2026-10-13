# EP-004 — Recuperación, reclamaciones, devoluciones e historial

## Épica

Como usuario de Lost&Found UEx, quiero solicitar y gestionar la recuperación de un objeto encontrado mediante un proceso controlado y trazable, para demostrar su pertenencia y conocer el resultado de la reclamación.

- **Objetivos relacionados:** G-02, G-03
- **Alcance relacionado:** S-04 — Solicitud de recuperación; S-05 — Gestión de reclamaciones y devoluciones; R-07 — Trazabilidad
- **Indicadores relacionados:** M-03 — Usuarios que completan una solicitud de recuperación; M-04 — Estados correctamente reflejados
- **Prioridad:** Must
- **Estimación:** 24 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** EP-001, EP-002, EP-003
- **Plan inicial:** Release 2, Iteraciones 4 y 5

## Historias de usuario

### US-015 — Solicitar la recuperación de un objeto

Como usuario autenticado, quiero solicitar la recuperación de un objeto encontrado y aportar información que demuestre que me pertenece, para iniciar el proceso de reclamación de forma clara.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-006, US-014
- **Plan inicial:** Release 2, Iteración 4

#### Criterios de aceptación

- **US-015-AC-01:** El usuario autenticado puede iniciar una solicitud desde el detalle público de un objeto encontrado que esté Disponible.
- **US-015-AC-02:** El usuario puede aportar información adicional para demostrar que el objeto le pertenece.
- **US-015-AC-03:** Al enviar una solicitud válida, esta se crea con estado Pendiente y queda asociada al usuario y al objeto correspondiente.
- **US-015-AC-04:** El objeto pasa a estado En reclamación cuando recibe al menos una solicitud pendiente.
- **US-015-AC-05:** El sistema valida la información obligatoria y muestra un mensaje comprensible si la solicitud no puede enviarse.

#### Verificación y restricciones

- Verificar que al menos 4 de 5 participantes completan una solicitud correctamente y sin ayuda.
- Verificar que no se puede solicitar la recuperación de un aviso de pérdida, de un objeto no Disponible o de un objeto inexistente.
- Cumplir R-04, R-05, R-08, R-09, R-11 y A-05.

### US-016 — Consultar y cancelar solicitudes propias

Como usuario autenticado, quiero consultar el estado de mis solicitudes y cancelar una solicitud pendiente, para conocer el progreso de mis reclamaciones y retirar una petición mientras todavía no ha sido revisada.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-015
- **Plan inicial:** Release 2, Iteración 4

#### Criterios de aceptación

- **US-016-AC-01:** El usuario puede consultar el listado y detalle de sus solicitudes de recuperación.
- **US-016-AC-02:** Cada solicitud muestra el objeto relacionado, su estado actual y, cuando corresponda, el motivo de rechazo, aprobación o cancelación.
- **US-016-AC-03:** El usuario puede cancelar una solicitud propia mientras permanezca Pendiente.
- **US-016-AC-04:** Una solicitud cancelada no puede volver a ser revisada ni aprobada.
- **US-016-AC-05:** El usuario no puede consultar ni cancelar solicitudes de otras personas.

#### Verificación y restricciones

- Verificar las transiciones Pendiente → Cancelada y el bloqueo de la cancelación después de la revisión.
- Verificar que el objeto deja de estar En reclamación cuando ya no quedan solicitudes pendientes.
- Cumplir D-07, R-05, R-07, R-08 y R-09.

### US-017 — Confirmar la recepción y revisar solicitudes

Como Responsable, quiero confirmar la recepción de los objetos encontrados y consultar las solicitudes pendientes, para gestionar únicamente objetos que estén realmente depositados en un punto de entrega.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-006, US-004
- **Plan inicial:** Release 2, Iteración 4

#### Criterios de aceptación

- **US-017-AC-01:** El Responsable puede consultar los objetos encontrados pendientes de recepción en los puntos de entrega.
- **US-017-AC-02:** El Responsable puede confirmar la recepción de un objeto y el objeto pasa de Pendiente de entrega a Disponible.
- **US-017-AC-03:** El Responsable puede consultar las solicitudes pendientes de revisión.
- **US-017-AC-04:** El Responsable puede consultar la información aportada por el reclamante junto con los rasgos identificativos ocultos del objeto.
- **US-017-AC-05:** Un usuario sin rol Responsable no puede confirmar recepciones ni consultar la información reservada de las solicitudes.

#### Verificación y restricciones

- Verificar el control de permisos en la interfaz y en la API.
- Verificar que la recepción no puede confirmarse dos veces y que un objeto no Disponible no puede reclamarse.
- Cumplir D-03, D-04, R-05, R-08, R-09 y R-11.

### US-018 — Resolver una reclamación

Como Responsable, quiero aprobar o rechazar una solicitud indicando un motivo, para decidir de forma fundamentada quién puede recuperar un objeto.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-016, US-017
- **Plan inicial:** Release 2, Iteración 5

#### Criterios de aceptación

- **US-018-AC-01:** El Responsable puede aprobar una solicitud pendiente cuando la información aportada coincide suficientemente con los rasgos identificativos del objeto.
- **US-018-AC-02:** El Responsable puede rechazar una solicitud pendiente indicando un motivo.
- **US-018-AC-03:** Al aprobar una solicitud, las demás solicitudes del mismo objeto se rechazan automáticamente con un motivo.
- **US-018-AC-04:** Una solicitud revisada deja de estar Pendiente y no puede aprobarse, rechazarse ni cancelarse de nuevo.
- **US-018-AC-05:** El solicitante recibe una notificación dentro de la aplicación cuando cambia el estado de su solicitud.
- **US-018-AC-06:** El sistema registra el usuario responsable, la fecha y el motivo de la decisión.
- **US-018-AC-07:** Cuando una solicitud es rechazada y no quedan solicitudes pendientes para el objeto, el objeto vuelve al estado Disponible.

#### Verificación y restricciones

- Verificar la aprobación, el rechazo, la aprobación con varias solicitudes y los intentos de modificar solicitudes ya revisadas.
- Verificar que cada decisión actualiza el estado mostrado al solicitante y genera un evento de historial.
- Cumplir D-05, D-07, D-08, R-05, R-07, R-08, R-09 y R-11.

### US-019 — Marcar un objeto como devuelto y consultar su historial

Como Responsable, quiero marcar como devuelto un objeto cuya solicitud ha sido aprobada y consultar el historial de su gestión, para mantener constancia de la devolución y de los cambios realizados.

- **Prioridad:** Must
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-018
- **Plan inicial:** Release 2, Iteración 5

#### Criterios de aceptación

- **US-019-AC-01:** El Responsable puede marcar como Devuelto un objeto cuando existe una solicitud aprobada.
- **US-019-AC-02:** El sistema no permite marcar como devuelto un objeto sin una solicitud aprobada o que ya se encuentre Devuelto.
- **US-019-AC-03:** El Responsable y el Administrador pueden consultar el historial de cambios asociado al objeto y a sus solicitudes.
- **US-019-AC-04:** Cada evento de historial incluye como mínimo el estado o acción realizada, la fecha, el usuario y el motivo cuando sea aplicable.
- **US-019-AC-05:** El historial es consistente con el estado actual del objeto y de sus solicitudes y no puede ser alterado desde la aplicación.

#### Verificación y restricciones

- Verificar la transición En reclamación → Devuelto y los intentos de devolución en estados no permitidos.
- Verificar que el 100 % de los objetos y solicitudes utilizados en las pruebas muestran correctamente su estado actual y su historial.
- Cumplir A-05, A-06, D-08, R-05, R-07, R-08 y R-09.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Proporcionar un proceso claro, organizado y fiable para solicitar y gestionar la recuperación de objetos |
| Objetivos | G-02 — Recuperación de objetos; G-03 — Trazabilidad y confianza |
| Alcance | S-04, S-05 y R-07 |
| Indicadores | M-03 — Al menos 4 de 5 participantes completan correctamente una solicitud; M-04 — El 100 % de los objetos y solicitudes de prueba reflejan su estado e historial |
| Estados | Objeto encontrado: Pendiente de entrega → Disponible → En reclamación → Devuelto; solicitud: Pendiente → Aprobada/Rechazada o Cancelada |
| Restricciones | R-04, R-05, R-07, R-08, R-09 y R-11 |
| Decisiones | D-03, D-04, D-05, D-07 y D-08 |
