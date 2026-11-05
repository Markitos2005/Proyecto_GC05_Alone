# EP-003 — Avisos independientes de objetos perdidos

## Épica

Como usuario de Lost&Found UEx, quiero publicar y consultar avisos sobre objetos que he perdido cuando no aparecen entre los hallazgos de Conserjería, para aumentar la posibilidad de que otra persona los reconozca, aportando opcionalmente información de contacto para aportar vías de comunicación y agilizar devoluciones.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-05 — Feed independiente de pérdidas
- **Indicador relacionado:** M-04 — Feed de pérdidas
- **Prioridad:** Should
- **Estimación:** 24 h-p
- **Incertidumbre:** Media
- **Predecesoras:** EP-001
- **Plan inicial:** IT-03 e IT-04

El feed de pérdidas es independiente del flujo formal de recuperación. Publicar un aviso no crea un hallazgo, no inicia una solicitud de recuperación, no modifica publicaciones de Conserjería y no obliga a ningún Conserje a revisar el aviso.

## Historias de usuario

### US-013 — Publicar un aviso de pérdida

Como Usuario autenticado, quiero publicar un aviso sobre un objeto que he perdido cuando no aparece ningún hallazgo coincidente, para que otras personas puedan reconocerlo si lo han encontrado.

- **Prioridad:** Should
- **Estimación:** 7 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-013-AC-01:** El Usuario autenticado puede iniciar la creación de un aviso de pérdida.
- **US-013-AC-02:** El Usuario puede indicar categoría, descripción, fecha aproximada y facultad o centro donde perdió el objeto.
- **US-013-AC-03:** El Usuario puede añadir información de contacto adicional de forma voluntaria y conforme a los campos permitidos.
- **US-013-AC-04:** El Usuario puede incluir rasgos identificativos privados que no se muestran en el feed público.
- **US-013-AC-05:** El sistema valida los campos obligatorios, la longitud de los textos y la facultad o centro seleccionados antes de guardar.
- **US-013-AC-06:** Al completarse correctamente, el aviso se crea con estado `Activo`, queda asociado a su autor y aparece en el feed de pérdidas.
- **US-013-AC-07:** La interfaz informa de que el aviso no inicia una solicitud de recuperación ni implica que el objeto esté bajo custodia de la Universidad.
- **US-013-AC-08:** Si la validación falla, el sistema informa del error y no crea un aviso incompleto.

#### Verificación y restricciones

- Verificar la publicación con datos válidos, campos vacíos, textos demasiado largos y una facultad o centro inexistente.
- Verificar que la información privada y los datos de contacto no se muestran en los listados públicos sin autorización.
- Verificar que publicar el aviso no crea un hallazgo ni una solicitud de recuperación.
- Cumplir R-03, R-04, R-05, R-07, R-09, R-12 y A-07.

### US-014 — Consultar el feed de avisos

Como Usuario, quiero consultar los avisos de pérdida activos, para comprobar si alguien ha encontrado un objeto parecido o conocer pérdidas comunicadas en mi entorno.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-013
- **Plan inicial:** IT-03

#### Criterios de aceptación

- **US-014-AC-01:** El Usuario puede consultar un listado paginado de avisos de pérdida en estado `Activo`.
- **US-014-AC-02:** Cada resultado muestra como mínimo categoría, descripción pública, facultad o centro, fecha aproximada y estado.
- **US-014-AC-03:** El feed no muestra los rasgos identificativos privados del aviso.
- **US-014-AC-04:** El sistema no expone automáticamente la dirección de correo ni otros datos no autorizados del autor.
- **US-014-AC-05:** El sistema informa de forma comprensible cuando no existen avisos activos o la página solicitada no es válida.
- **US-014-AC-06:** El feed de pérdidas se presenta separado del listado de hallazgos de Conserjería y no mezcla ambos tipos de publicación.

#### Verificación y restricciones

- Verificar el feed sin avisos, con un aviso y con varias páginas de resultados.
- Verificar el aislamiento entre avisos de pérdidas y hallazgos.
- Verificar que solo se muestra información pública y sintética.
- Cumplir R-03, R-05, R-07, R-09, R-12 y A-07.

### US-015 — Buscar y filtrar avisos de pérdida

Como Usuario, quiero buscar y filtrar avisos de pérdida por texto, categoría y facultad o centro, para localizar comunicaciones relacionadas con un objeto.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-014
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-015-AC-01:** El Usuario puede buscar texto en los campos públicos de los avisos activos.
- **US-015-AC-02:** El Usuario puede filtrar por categoría y por facultad o centro.
- **US-015-AC-03:** La búsqueda no distingue entre mayúsculas y minúsculas y no consulta información privada.
- **US-015-AC-04:** Los filtros pueden combinarse y los resultados siguen mostrando únicamente avisos `Activos`.
- **US-015-AC-05:** El sistema informa de forma comprensible cuando no hay coincidencias.
- **US-015-AC-06:** Un resultado del feed no ofrece una acción para iniciar una solicitud formal de recuperación ni para cambiar un hallazgo de Conserjería.

#### Verificación y restricciones

- Verificar búsquedas con coincidencias, sin coincidencias, texto vacío y combinaciones de filtros.
- Verificar que no se filtra ni ordena usando datos privados.
- Verificar que el feed continúa desacoplado del flujo formal de recuperación.
- Cumplir R-04, R-05, R-09, R-07 y R-12.

### US-016 — Editar un aviso propio

Como Usuario que ha publicado un aviso de pérdida, quiero editar su información, para mantener actualizada la descripción mientras sigo buscando el objeto.

- **Prioridad:** Should
- **Estimación:** 6 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-013
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-016-AC-01:** El autor puede editar un aviso propio mientras permanezca en estado `Activo`.
- **US-016-AC-02:** El autor puede modificar los campos permitidos, incluidos categoría, descripción, facultad o centro, fecha e información de contacto autorizada.
- **US-016-AC-03:** El sistema valida los datos modificados antes de guardarlos.
- **US-016-AC-04:** La edición conserva el autor, el estado y el historial del aviso.
- **US-016-AC-05:** Un Usuario no puede editar un aviso de otra persona.
- **US-016-AC-06:** Editar un aviso no modifica hallazgos ni solicitudes de recuperación existentes.

#### Verificación y restricciones

- Verificar la edición válida, la validación de campos y el rechazo de intentos de edición de otros usuarios.
- Verificar la conservación del historial y la separación respecto a hallazgos y solicitudes.
- Cumplir R-04, R-05, R-07, R-09 y R-12.

### US-017 — Cerrar un aviso propio

Como Usuario que ha publicado un aviso de pérdida, quiero cerrarlo cuando recupere el objeto o deje de buscarlo, para que deje de aparecer como una pérdida activa.

- **Prioridad:** Should
- **Estimación:** 3 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-013
- **Plan inicial:** IT-04

#### Criterios de aceptación

- **US-017-AC-01:** El autor puede cerrar un aviso propio que esté `Activo`.
- **US-017-AC-02:** El autor puede indicar el motivo del cierre, como objeto recuperado o búsqueda cancelada.
- **US-017-AC-03:** El aviso pasa de `Activo` a `Cerrado` y deja de aparecer en el feed activo.
- **US-017-AC-04:** El sistema registra el cierre con fecha, autor y motivo.
- **US-017-AC-05:** Un Usuario no puede cerrar un aviso publicado por otra persona.
- **US-017-AC-06:** Un aviso `Cerrado` no puede volver a `Activo` mediante esta funcionalidad.
- **US-017-AC-07:** Cerrar un aviso no marca como `Devuelto` ningún hallazgo ni modifica una solicitud de recuperación.

#### Verificación y restricciones

- Verificar la transición `Activo → Cerrado`, los motivos de cierre y la desaparición del feed activo.
- Verificar el rechazo de operaciones de otros usuarios y sobre avisos ya cerrados.
- Verificar que el historial permanece disponible sin reactivar el aviso.
- Cumplir R-05, R-07, R-09, R-11 y R-12.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Permitir que las personas comuniquen pérdidas aunque todavía no exista un hallazgo en Conserjería |
| Objetivo | G-04 — Avisos de pérdidas |
| Alcance | S-05 — Feed independiente de pérdidas |
| Indicador | M-04 — Un Usuario puede publicar y consultar avisos de pérdidas sin mezclarlos con los hallazgos de Conserjería |
| Historias | US-013, US-014, US-015, US-016 y US-017 |
| Estado | Aviso de pérdida: `Activo → Cerrado` |
| Información pública | Categoría, descripción pública, facultad o centro, fecha aproximada y estado |
| Información privada | Rasgos identificativos privados y datos de contacto no autorizados |
| Separación funcional | El aviso no crea hallazgos, solicitudes de recuperación ni validaciones de Conserjería |
| Restricciones | R-03, R-04, R-05, R-07, R-09, R-11 y R-12 |
| Decisiones | D-02, D-04, D-09 y D-11 |
