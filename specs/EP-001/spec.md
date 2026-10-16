# EP-001 — Gestión de cuenta, identidad y perfil

## Épica

Como usuario de Lost&Found UEx, quiero crear y gestionar mi cuenta, identidad y perfil, para acceder de forma segura a las funcionalidades de la plataforma y facilitar el contacto relacionado con los objetos.

- **Objetivos relacionados:** G-05
- **Alcance relacionado:** S-01 — Gestión de cuenta y autenticación
- **Indicador relacionado:** M-05 — Acceso y autorización
- **Prioridad:** Must
- **Estimación:** 46 h-p
- **Incertidumbre:** Media
- **Predecesoras:** —
- **Plan inicial:** IT-01 e IT-02

## Historias de usuario

### US-001 — Registro de usuarios

Como nuevo usuario, quiero registrarme con mi correo electrónico y contraseña, para disponer de una cuenta en la plataforma.

- **Prioridad:** Must
- **Estimación:** 12 h-p
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
- **Estimación:** 6 h-p
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

### US-003 — Cierre de sesión

Como usuario autenticado, quiero cerrar mi sesión, para garantizar la seguridad de mi cuenta y evitar el acceso de otras personas en el mismo dispositivo.

- **Prioridad:** Must
- **Estimación:** 3 h-p
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

### US-004 — Recuperar la contraseña olvidada

Como usuario registrado que ha olvidado su contraseña, quiero solicitar un enlace de restablecimiento a mi correo, para recuperar el acceso a mi cuenta sin intervención de un Administrador.

- **Prioridad:** Should
- **Estimación:** 8 h-p
- **Incertidumbre:** Media
- **Predecesoras:** US-001, US-002, US-003
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-004-AC-01:** El usuario puede solicitar la recuperación desde la pantalla de inicio de sesión indicando su correo electrónico.
- **US-004-AC-02:** El sistema muestra el mismo mensaje de confirmación tanto si el correo está asociado a una cuenta como si no, sin revelar su existencia.
- **US-004-AC-03:** Si el correo pertenece a una cuenta activa con credenciales locales, el sistema envía un enlace de restablecimiento de un solo uso y con caducidad limitada.
- **US-004-AC-04:** El sistema no envía enlaces de restablecimiento a cuentas desactivadas.
- **US-004-AC-05:** Una nueva solicitud invalida los enlaces anteriores que no se hayan utilizado.
- **US-004-AC-06:** El usuario puede establecer una nueva contraseña desde un enlace válido, cumpliendo las mismas reglas de fortaleza que en el registro.
- **US-004-AC-07:** El sistema rechaza enlaces caducados, ya utilizados o manipulados con un mensaje comprensible.
- **US-004-AC-08:** Al restablecer la contraseña, el enlace queda invalidado y se cierran todas las sesiones activas de la cuenta.
- **US-004-AC-09:** La nueva contraseña se almacena protegida mediante un mecanismo de hash seguro y nunca se envía por correo.
- **US-004-AC-10:** El sistema limita el número de solicitudes de recuperación para un mismo correo en un periodo de tiempo.

#### Verificación y restricciones

- Verificar el flujo completo con un correo registrado, un correo inexistente y una cuenta desactivada.
- Verificar el rechazo de enlaces caducados, reutilizados, manipulados y anteriores a una nueva solicitud.
- Verificar que las sesiones abiertas dejan de ser válidas tras el restablecimiento y que la contraseña anterior ya no permite iniciar sesión.
- Verificar el límite de solicitudes y que ni el enlace ni la contraseña aparecen en registros ni respuestas de la API.
- Utilizar únicamente datos ficticios o sintéticos y un servidor de correo de pruebas.
- Cumplir R-03, R-04, R-05, R-06, R-07, R-08 y R-09.

### US-005 — Gestión de perfil e información de contacto

Como usuario autenticado, quiero editar mis datos y teléfono de contacto, para que me localicen si reclamo un objeto.

- **Prioridad:** Must
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-002
- **Plan inicial:** IT-01

#### Criterios de aceptación

- **US-005-AC-01:** El usuario autenticado puede consultar su perfil y editar los campos permitidos.
- **US-005-AC-02:** El usuario puede añadir, modificar o eliminar su teléfono de contacto conforme a las reglas del sistema.
- **US-005-AC-03:** El sistema valida el formato y los límites de los datos antes de guardarlos.
- **US-005-AC-04:** Un usuario solo puede consultar y editar su propio perfil.
- **US-005-AC-05:** El cambio de perfil conserva la identidad, rol y publicaciones asociadas a la cuenta.
- **US-005-AC-06:** El sistema informa de forma comprensible ante datos inválidos o una operación no autorizada.

#### Verificación y restricciones

- Verificar consulta, alta, edición y eliminación del teléfono, datos inválidos y aislamiento entre usuarios.
- Verificar que el teléfono solo se muestra en las operaciones y vistas autorizadas.
- Cumplir R-03, R-04, R-05, R-08, R-09 y R-11.

### US-006 — Cambiar la contraseña desde el perfil

Como usuario autenticado, quiero cambiar mi contraseña desde mi perfil, para mantener la seguridad de mi cuenta cuando sospeche que ha podido verse comprometida o quiera renovarla.

- **Prioridad:** Should
- **Estimación:** 4 h-p
- **Incertidumbre:** Baja
- **Predecesoras:** US-001, US-002, US-004
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-006-AC-01:** El usuario autenticado puede iniciar el cambio de contraseña desde su perfil.
- **US-006-AC-02:** El sistema exige la contraseña actual y la nueva contraseña introducida dos veces.
- **US-006-AC-03:** El sistema rechaza el cambio si la contraseña actual es incorrecta, si las dos nuevas no coinciden o si la nueva es igual a la actual.
- **US-006-AC-04:** La nueva contraseña cumple las mismas reglas de fortaleza que en el registro.
- **US-006-AC-05:** La nueva contraseña se almacena protegida mediante un mecanismo de hash seguro.
- **US-006-AC-06:** Tras el cambio, la sesión actual se mantiene y el resto de sesiones activas de la cuenta se cierran.
- **US-006-AC-07:** El sistema limita los intentos fallidos consecutivos con una contraseña actual incorrecta.
- **US-006-AC-08:** Si la cuenta solo utiliza OAuth y no tiene contraseña local, la opción no se ofrece.
- **US-006-AC-09:** El sistema registra el cambio con la fecha y la cuenta afectada, sin almacenar ninguna contraseña en claro.
- **US-006-AC-10:** El sistema informa de forma comprensible del resultado sin revelar credenciales ni información sensible.

#### Verificación y restricciones

- Verificar el cambio correcto, la contraseña actual incorrecta, la confirmación que no coincide, la contraseña repetida y la contraseña débil.
- Verificar que la contraseña anterior deja de ser válida, que la sesión actual continúa y que las demás sesiones se cierran.
- Verificar el límite de intentos fallidos y que las contraseñas no aparecen en registros ni respuestas de la API.
- Utilizar únicamente datos ficticios o sintéticos durante las pruebas.
- Cumplir R-03, R-04, R-05, R-06, R-07, R-08 y R-09.

### US-007 — Inicio de sesión alternativo mediante OAuth

Como usuario, quiero iniciar sesión mediante una cuenta de Microsoft (preferiblemente asociada a la Universidad de Extremadura), para acceder sin introducir credenciales locales.

- **Prioridad:** Could
- **Estimación:** 9 h-p
- **Incertidumbre:** Alta
- **Predecesoras:** US-002, US-004
- **Plan inicial:** IT-02

#### Criterios de aceptación

- **US-007-AC-01:** El usuario puede iniciar el flujo OAuth desde la aplicación seleccionando un proveedor configurado.
- **US-007-AC-02:** Una autenticación válida en Google o GitHub crea o vincula una cuenta local sin duplicar la identidad del usuario.
- **US-007-AC-03:** La cuenta OAuth queda asociada al perfil y permisos correspondientes.
- **US-007-AC-04:** La aplicación no almacena la contraseña del proveedor externo.
- **US-007-AC-05:** El sistema rechaza respuestas OAuth inválidas, canceladas o caducadas con un mensaje comprensible.
- **US-007-AC-06:** Si la integración no se implementa en el alcance actual, el inicio de sesión local continúa funcionando sin degradación.

#### Verificación y restricciones

- Verificar autenticación correcta, cancelación, respuesta inválida y vinculación con una cuenta existente.
- Verificar que el flujo alternativo no expone ni almacena credenciales externas.
- Cumplir R-03, R-05, R-06, R-08, R-09 y A-02.

## Trazabilidad de la épica

| Elemento | Referencia |
| --- | --- |
| Misión | Facilitar una gestión segura y fiable de objetos perdidos y encontrados |
| Objetivo | G-05 — Acceso controlado |
| Alcance | S-01 — Gestión de cuenta y autenticación |
| Indicador | M-05 — El 100 % de las pruebas definidas para autenticación y autorización producen el comportamiento esperado |
| Historias | US-001, US-002, US-003, US-004 y US-005 |
| Iteraciones | IT-01 e IT-02 |
| Roles | Usuario y Administrador |
| Autenticación principal | Correo electrónico y contraseña |
| Autenticación alternativa | OAuth con Google o GitHub, prioridad Could |
| Restricciones | R-03, R-04, R-05, R-06, R-08, R-09 y R-11 |
