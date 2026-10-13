# EP-001 — Autenticación y roles

## Épica

Como usuario de Lost&Found UEx, quiero identificarme de forma segura y que el sistema adapte las operaciones disponibles a mi rol, para utilizar la aplicación con un acceso controlado y coherente con mis permisos.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-01 — Autenticación
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 16 h-p
- **Incertidumbre:** Media
- **Predecesoras:** —
- **Plan inicial:** Release 1, Iteración 1

## Historias de usuario

### US-001 — Inicio de sesión mediante proveedor externo

Como usuario de Lost&Found UEx, quiero iniciar sesión mediante un proveedor externo de autenticación, para acceder a la aplicación sin que esta almacene directamente mis credenciales.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** —
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-001-AC-01:** El usuario puede iniciar el flujo de autenticación desde la aplicación y es redirigido al proveedor externo configurado.
- **US-001-AC-02:** Cuando el proveedor externo autentica correctamente al usuario, la aplicación crea una sesión identificada para ese usuario y permite acceder a las funcionalidades autorizadas.
- **US-001-AC-03:** La aplicación no almacena las credenciales del usuario del proveedor externo.

#### Verificación y restricciones

- Verificar mediante pruebas de integración que el acceso correcto crea una sesión y que un acceso rechazado por el proveedor no permite entrar en la aplicación.
- Comprobar que las pruebas utilizan únicamente cuentas y datos ficticios o sintéticos.
- Cumplir R-03, R-04, R-05, R-06 y A-02.

### US-002 — Creación del usuario y asignación del rol inicial

Como usuario que accede por primera vez, quiero que la aplicación cree mi perfil automáticamente con el rol Usuario, para poder utilizar el servicio sin una gestión manual previa y con permisos limitados por defecto.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-002-AC-01:** Tras el primer acceso autenticado, la aplicación crea un registro del usuario si todavía no existe.
- **US-002-AC-02:** Todo usuario creado por primera vez reciben el rol Usuario por defecto.
- **US-002-AC-03:** Un acceso posterior reutiliza el usuario existente y no crea registros duplicados.

#### Verificación y restricciones

- Verificar con pruebas de integración el primer acceso, los accesos posteriores y la ausencia de duplicados.
- Verificar que la identidad utilizada para reconocer al usuario procede del proveedor externo y que no se almacenan credenciales locales.
- Cumplir D-04, R-03, R-05, R-06 y A-08.

### US-003 — Cierre de sesión

Como usuario autenticado, quiero cerrar mi sesión, para impedir que otra persona utilice mi acceso desde el mismo dispositivo.

- **Prioridad:** Must
- **Estimación:** 2 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-001
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-003-AC-01:** El usuario autenticado puede iniciar el cierre de sesión desde la aplicación.
- **US-003-AC-02:** Tras cerrar la sesión, las páginas y operaciones que requieren autenticación dejan de estar disponibles hasta volver a identificarse.
- **US-003-AC-03:** El sistema informa de forma comprensible cuando se intenta acceder a una operación autenticada sin una sesión activa.

#### Verificación y restricciones

- Verificar mediante pruebas funcionales que una sesión cerrada no permite acceder a operaciones protegidas.
- Cumplir R-05 y R-08.

### US-004 — Autorización según el rol

Como responsable de la aplicación, quiero que cada operación compruebe el rol del usuario, para asegurar que solo las personas autorizadas puedan realizar acciones de Usuario, Responsable o Administrador.

- **Prioridad:** Must
- **Estimación:** 5 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002
- **Plan inicial:** Release 1, Iteración 1

#### Criterios de aceptación

- **US-004-AC-01:** El sistema reconoce los roles Usuario, Responsable y Administrador.
- **US-004-AC-02:** Un Usuario solo puede ejecutar las operaciones autorizadas para su rol.
- **US-004-AC-03:** Un Responsable puede ejecutar las operaciones autorizadas para responsables, además de las que correspondan a un Usuario.
- **US-004-AC-04:** Un Administrador puede ejecutar las operaciones administrativas autorizadas.
- **US-004-AC-05:** Una operación no autorizada se rechaza tanto desde la interfaz como desde la API y muestra un mensaje comprensible.
- **US-004-AC-06:** El administrador puede asignar y retirar el rol Responsable sin modificar directamente el código.

#### Verificación y restricciones

- Verificar el acceso permitido y denegado para cada rol mediante pruebas de autorización sobre la interfaz y la API.
- Verificar que retirar el rol Responsable impide las operaciones reservadas a ese rol en el siguiente acceso o actualización de permisos.
- Cumplir D-04, R-05, R-08, R-09 y R-11.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Proporcionar una gestión clara, organizada y fiable de objetos perdidos y encontrados |
| Objetivo | G-04 — Acceso controlado |
| Alcance | S-01 — Autenticación |
| Indicador | M-05 — El 100 % de las pruebas de autenticación y autorización producen el comportamiento esperado |
| Restricciones | R-03, R-04, R-05, R-06, R-08, R-09 y R-11 |
| Decisiones | D-04 — Todo usuario nuevo entra como Usuario; el administrador asigna el rol Responsable |

