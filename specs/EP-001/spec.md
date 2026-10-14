# EP-001 — Acceso y perfiles

## Épica

Como usuario de Lost&Found UEx, quiero identificarme y disponer de un perfil asociado a mis publicaciones, para utilizar los feeds de hallazgos y solicitudes de forma controlada.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-01 — Autenticación
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 14 h-p
- **Incertidumbre:** Media
- **Predecesoras:** —
- **Plan inicial:** Release 1, Iteración 1

## Historias de usuario

### US-001 — Inicio de sesión mediante proveedor externo

Como usuario, quiero iniciar sesión mediante un proveedor externo de autenticación, para acceder a la aplicación sin que esta almacene directamente mis credenciales.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** —
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-001-AC-01:** El usuario puede iniciar el flujo de autenticación desde la aplicación y es redirigido al proveedor externo configurado.
- **US-001-AC-02:** Cuando el proveedor autentica correctamente al usuario, la aplicación crea una sesión identificada y permite acceder a las funcionalidades autorizadas.
- **US-001-AC-03:** La aplicación no almacena las credenciales del usuario del proveedor externo.

#### Verificación y restricciones

- Verificar mediante pruebas de integración el acceso correcto y el rechazo de accesos no autenticados.
- Utilizar únicamente cuentas y datos ficticios o sintéticos.
- Cumplir R-03, R-04, R-05, R-06 y A-02.

### US-002 — Creación del perfil de usuario

Como usuario que accede por primera vez, quiero que la aplicación cree mi perfil automáticamente con el rol Usuario, para publicar hallazgos y solicitudes sin una gestión manual previa.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-002-AC-01:** Tras el primer acceso autenticado, la aplicación crea un perfil si todavía no existe.
- **US-002-AC-02:** Todo perfil nuevo recibe el rol Usuario por defecto.
- **US-002-AC-03:** Un acceso posterior reutiliza el perfil existente y no crea duplicados.
- **US-002-AC-04:** El perfil conserva la identidad necesaria para asociar al usuario sus publicaciones y contactos.

#### Verificación y restricciones

- Verificar el primer acceso, los accesos posteriores y la ausencia de perfiles duplicados.
- Verificar que la identidad procede del proveedor externo y que no se almacenan credenciales locales.
- Cumplir R-03, R-05, R-06 y A-08.

### US-003 — Cierre de sesión

Como usuario autenticado, quiero cerrar mi sesión, para impedir que otra persona utilice mi acceso desde el mismo dispositivo.

- **Prioridad:** Must
- **Estimación:** 2 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-001
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-003-AC-01:** El usuario autenticado puede iniciar el cierre de sesión.
- **US-003-AC-02:** Tras cerrar la sesión, las operaciones que requieren autenticación dejan de estar disponibles hasta volver a identificarse.
- **US-003-AC-03:** El sistema informa de forma comprensible cuando se intenta acceder a una operación autenticada sin sesión activa.

#### Verificación y restricciones

- Verificar que una sesión cerrada no permite publicar, editar ni contactar.
- Cumplir R-05 y R-08.

### US-004 — Autorización de Usuario y Administrador

Como responsable de la aplicación, quiero que el sistema diferencie las operaciones de Usuario y Administrador.

- **Prioridad:** Must
- **Estimación:** 3 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-004-AC-01:** El sistema reconoce los roles Usuario y Administrador.
- **US-004-AC-02:** Los usuarios nuevos reciben el rol Usuario y pueden publicar y gestionar únicamente sus propios contenidos.
- **US-004-AC-03:** El Administrador puede ejecutar las operaciones administrativas autorizadas.
- **US-004-AC-04:** Una operación no autorizada se rechaza tanto desde la interfaz como desde la API y muestra un mensaje comprensible.

#### Verificación y restricciones

- Verificar el acceso permitido y denegado para Usuario y Administrador en la interfaz y en la API.
- Cumplir R-05, R-08 y R-09.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar una gestión clara, organizada y fiable de objetos perdidos y encontrados |
| Objetivo | G-04 — Acceso controlado |
| Alcance | S-01 — Autenticación |
| Indicador | M-05 — El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado |
| Roles | Usuario y Administrador |
| Restricciones | R-03, R-04, R-05, R-06, R-08 y R-09 |
