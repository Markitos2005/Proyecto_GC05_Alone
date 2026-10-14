# EP-001 — Gestión de cuenta, identidad y perfil

## Épica

Como usuario de Lost&Found UEx, quiero crear y gestionar mi cuenta, identidad y perfil, para acceder de forma segura a las funcionalidades de la plataforma y facilitar el contacto relacionado con los objetos.

- **Objetivos relacionados:** G-04
- **Alcance relacionado:** S-01 — Gestión de cuenta y autenticación
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 48 h-p
- **Incertidumbre:** Media
- **Predecesoras:** —
- **Plan inicial:** IT-01 e IT-02

## Historias de usuario

### US-001 — Registro de cuenta con credenciales

Como nuevo usuario, quiero registrarme con mi correo electrónico y contraseña, para disponer de una cuenta en la plataforma.

- **Prioridad:** Must
- **Estimación:** 11 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** —
- **Plan inicial:** IT-01

#### Criterios de aceptación

- **US-001-AC-01:** El usuario puede registrarse proporcionando un correo electrónico y una contraseña válidos.
- **US-001-AC-02:** El sistema valida el formato del correo, la fortaleza mínima de la contraseña y los campos obligatorios.
- **US-001-AC-03:** El sistema rechaza el registro si el correo ya está asociado a una cuenta activa.
- **US-001-AC-04:** La contraseña no se almacena en texto claro y se protege mediante un mecanismo de hash seguro.
- **US-001-AC-05:** La cuenta se crea con rol Usuario por defecto y queda preparada para iniciar sesión.
- **US-001-AC-06:** El sistema informa de forma comprensible de los errores sin revelar credenciales ni información sensible.

#### Verificación y restricciones

- Verificar registro válido, correo duplicado, correo inválido, contraseña insuficiente y almacenamiento no reversible de la contraseña.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-04, R-05, R-06 y R-08.

### US-002 — Inicio de sesión con credenciales locales

Como usuario registrado, quiero autenticarme con mi correo y contraseña, para acceder a las funciones del sistema.

- **Prioridad:** Must
- **Estimación:** 11 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-001
- **Plan inicial:** IT-01

#### Criterios de aceptación

- **US-002-AC-01:** El usuario puede iniciar sesión proporcionando las credenciales de una cuenta registrada.
- **US-002-AC-02:** Las credenciales válidas crean una sesión autenticada y permiten acceder a las operaciones autorizadas.
- **US-002-AC-03:** El sistema rechaza credenciales incorrectas, cuentas inexistentes y cuentas desactivadas con un mensaje comprensible.
- **US-002-AC-04:** El sistema no revela si el correo existe cuando las credenciales no son válidas.
- **US-002-AC-05:** La sesión autenticada identifica al usuario y permite aplicar sus permisos.

#### Verificación y restricciones

- Verificar inicio correcto, contraseña incorrecta, correo inexistente y cuenta desactivada.
- Verificar que las credenciales no aparecen en registros ni respuestas de la API.
- Cumplir R-04, R-05, R-06, R-08 y R-09.

### US-003 — Cierre de sesión seguro

Como usuario autenticado, quiero cerrar mi sesión, para garantizar la seguridad de mi cuenta en terminales compartidos.

- **Prioridad:** Must
- **Estimación:** 7 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-002
- **Plan inicial:** IT-01

#### Criterios de aceptación

- **US-003-AC-01:** El usuario autenticado puede iniciar el cierre de sesión.
- **US-003-AC-02:** El cierre invalida la sesión y los tokens o credenciales temporales asociados conforme a la estrategia adoptada.
- **US-003-AC-03:** Una sesión cerrada no permite acceder a operaciones autenticadas.
- **US-003-AC-04:** El sistema informa de forma comprensible cuando se intenta utilizar una sesión cerrada.
- **US-003-AC-05:** El cierre de sesión no elimina la cuenta ni las publicaciones del usuario.

#### Verificación y restricciones

- Verificar acceso antes del cierre, acceso posterior con la sesión cerrada y nuevo inicio de sesión.
- Cumplir R-05, R-08 y R-09.

### US-004 — Gestión de perfil e información de contacto

Como usuario, quiero editar mis datos y teléfono de contacto, para que me localicen si reclamo o entrego un objeto.

- **Prioridad:** Must
- **Estimación:** 10 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-002
- **Plan inicial:** IT-01

#### Criterios de aceptación

- **US-004-AC-01:** El usuario autenticado puede consultar su perfil y editar los campos permitidos.
- **US-004-AC-02:** El usuario puede añadir, modificar o eliminar su teléfono de contacto conforme a las reglas del sistema.
- **US-004-AC-03:** El sistema valida el formato y los límites de los datos antes de guardarlos.
- **US-004-AC-04:** Un usuario solo puede consultar y editar su propio perfil.
- **US-004-AC-05:** El cambio de perfil conserva la identidad, rol y publicaciones asociadas a la cuenta.
- **US-004-AC-06:** El sistema informa de forma comprensible ante datos inválidos o una operación no autorizada.

#### Verificación y restricciones

- Verificar consulta, alta, edición y eliminación del teléfono, datos inválidos y aislamiento entre usuarios.
- Verificar que el teléfono solo se muestra en las operaciones y vistas autorizadas.
- Cumplir R-03, R-04, R-05, R-08, R-09 y R-11.

### US-005 — Inicio de sesión alternativo mediante OAuth

Como usuario, quiero iniciar sesión mediante Google o GitHub, para acceder sin introducir credenciales locales.

- **Prioridad:** Could
- **Estimación:** 9 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-002, US-004
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-005-AC-01:** El usuario puede iniciar el flujo OAuth desde la aplicación seleccionando un proveedor configurado.
- **US-005-AC-02:** Una autenticación válida en Google o GitHub crea o vincula una cuenta local sin duplicar la identidad del usuario.
- **US-005-AC-03:** La cuenta OAuth queda asociada al perfil y permisos correspondientes.
- **US-005-AC-04:** La aplicación no almacena la contraseña del proveedor externo.
- **US-005-AC-05:** El sistema rechaza respuestas OAuth inválidas, canceladas o caducadas con un mensaje comprensible.
- **US-005-AC-06:** Si la integración no se implementa en el alcance actual, el inicio de sesión local continúa funcionando sin degradación.

#### Verificación y restricciones

- Verificar autenticación correcta, cancelación, respuesta inválida y vinculación con una cuenta existente.
- Verificar que el flujo alternativo no expone ni almacena credenciales externas.
- Cumplir R-03, R-05, R-06, R-08, R-09 y A-02.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar una gestión segura y fiable de objetos perdidos y encontrados |
| Objetivo | G-04 — Acceso controlado |
| Alcance | S-01 — Gestión de cuenta y autenticación |
| Indicador | M-05 — El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado |
| Historias | US-001, US-002, US-003, US-004 y US-005 |
| Iteraciones | IT-01 e IT-02 |
| Roles | Usuario y Administrador |
| Autenticación principal | Correo electrónico y contraseña |
| Autenticación alternativa | OAuth con Google o GitHub, prioridad Could |
| Restricciones | R-03, R-04, R-05, R-06, R-08, R-09 y R-11 |
