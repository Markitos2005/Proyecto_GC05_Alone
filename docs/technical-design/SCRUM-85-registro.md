# SCRUM-85 — Diseño técnico del registro de usuarios

**Proyecto:** Lost&Found UEx  
**Historia de usuario:** US-001 — Registro de usuarios (SCRUM-10)  
**Subtarea:** SCRUM-85 — Tech Lead: Diseñar usuario y contraseñas  
**Responsable:** Ángel Parra García  
**Sprint:** IT-01  
**Tecnología:** JavaScript con Node.js  
**Estado del documento:** Diseño técnico definido por el Tech Lead para US-001

## 1. Objetivo

El objetivo de este documento es definir el diseño técnico del registro de usuarios de Lost&Found UEx, correspondiente a la historia US-001.

El diseño establece la estructura de almacenamiento de los usuarios, el funcionamiento del endpoint de registro, las validaciones necesarias y el procedimiento de almacenamiento seguro de contraseñas.

Este documento servirá como referencia para la implementación de SCRUM-83 y las pruebas de SCRUM-84.

## 2. Requisitos funcionales confirmados

Según los criterios de aceptación de US-001 y las aclaraciones realizadas por el Product Owner, se establecen los siguientes requisitos:

- **US-001-AC-01:** El usuario podrá registrarse mediante correo electrónico y contraseña válidos.
- **US-001-AC-02:** Se validará el formato del correo, la contraseña y los campos obligatorios.
- **US-001-AC-03:** No se permitirá registrar un correo asociado a una cuenta activa.
- **US-001-AC-04:** Las contraseñas se almacenarán utilizando un mecanismo de hash seguro.
- **US-001-AC-05:** Las cuentas se crearán con rol Usuario por defecto y quedarán preparadas para iniciar sesión.
- **US-001-AC-06:** Los errores se comunicarán sin revelar credenciales ni información sensible.

### Aclaraciones confirmadas del Product Owner

- La contraseña debe tener un mínimo de 8 caracteres.
- Debe contener al menos una letra y un número.
- Se aceptarán correos electrónicos válidos de cualquier dominio, sin limitar el registro a direcciones de la Universidad de Extremadura.

Estas reglas se consideran requisitos confirmados y deberán respetarse durante la implementación.

## 3. Arquitectura técnica propuesta

Se propone utilizar una arquitectura cliente-servidor con un backend desarrollado en JavaScript mediante Node.js.

Para gestionar las peticiones HTTP se propone utilizar Express.js, sujeto a la aprobación del equipo.

Se plantea separar las responsabilidades en las siguientes capas:

- **Rutas:** recepción de las peticiones HTTP.
- **Controladores:** gestión de las solicitudes y respuestas.
- **Servicios:** aplicación de las reglas de registro.
- **Persistencia:** acceso a la base de datos.
- **Seguridad:** validación y hash de contraseñas.

El flujo propuesto será:

1. El usuario introduce correo y contraseña.
2. El cliente envía una petición HTTP al servidor.
3. El servidor valida los datos recibidos.
4. El sistema consulta si el correo ya está registrado.
5. Si el registro está permitido, genera el hash de contraseña.
6. Se almacena la cuenta con rol USUARIO y estado activo.
7. El servidor devuelve una respuesta de confirmación sin incluir datos sensibles.

Esta arquitectura es una propuesta técnica, no una estructura confirmada del proyecto.

## 4. Diseño de la tabla de usuarios

Se propone utilizar una base de datos relacional, preferentemente PostgreSQL, aunque el sistema gestor definitivo debe confirmarse con el equipo.

La tabla se denominará `usuarios`.

| Campo | Tipo propuesto | Restricciones |
|---|---|---|
| id | UUID | Clave primaria, obligatorio |
| email | VARCHAR(254) | Obligatorio, único tras normalización |
| password_hash | VARCHAR(255) | Obligatorio para cuentas con contraseña local |
| rol | VARCHAR(20) | Obligatorio, valor inicial USUARIO |
| activo | BOOLEAN | Obligatorio, valor inicial TRUE |
| created_at | TIMESTAMP | Fecha de creación, obligatoria |
| updated_at | TIMESTAMP | Fecha de última modificación |

### Decisiones de diseño

**Identificador:** cada usuario tendrá un identificador UUID único.

**Correo electrónico:** se almacenará el correo normalizado para impedir duplicados por diferencias de mayúsculas o espacios exteriores. Se propone aplicar una restricción de unicidad en la base de datos.

**Contraseña:** se almacenará únicamente el hash generado por el algoritmo seleccionado, nunca la contraseña original.

**Rol:** las cuentas nuevas tendrán automáticamente el rol `USUARIO`.

**Estado:** se propone crear las cuentas con `activo = TRUE`, de forma que puedan iniciar sesión después del registro.

**Fechas:** se registrarán las fechas de creación y modificación de cada cuenta.

### Consideraciones para otras historias

El campo `activo` permitirá identificar cuentas desactivadas durante el inicio de sesión.

El identificador del usuario podrá reutilizarse en la gestión del perfil y en otras entidades del sistema.

La estructura debe mantenerse compatible con la futura autenticación OAuth, que podría necesitar cuentas sin contraseña local.

La posibilidad de reutilizar un correo perteneciente a una cuenta desactivada queda pendiente de definición. Inicialmente se propone mantener la unicidad del correo y no permitir la creación de una segunda cuenta con el mismo correo.

## 5. Diseño del endpoint de registro

### Endpoint propuesto

- **Método HTTP:** POST
- **Ruta:** `/api/auth/register`
- **Formato de entrada:** JSON
- **Autenticación previa:** no requerida

La ruta es una propuesta y deberá respetar las convenciones que adopte el backend.

### Datos de entrada

Se recibirán dos campos obligatorios:

| Campo | Tipo | Descripción |
|---|---|---|
| email | string | Correo electrónico del usuario |
| password | string | Contraseña elegida por el usuario |

Ejemplo de petición JSON:

`{"email":"usuario@example.com","password":"Prueba1234"}`

Este ejemplo utiliza datos ficticios.

### Respuesta correcta

Cuando se complete el registro, el servidor devolverá:

**Código HTTP:** `201 Created`

Ejemplo de respuesta:

`{"message":"Usuario registrado correctamente","user":{"id":"uuid-del-usuario","email":"usuario@example.com","rol":"USUARIO"}}`

La respuesta nunca incluirá la contraseña ni su hash.

### Respuestas de error propuestas

| Código HTTP | Situación | Mensaje propuesto |
|---|---|---|
| 400 | Campos obligatorios ausentes | Faltan campos obligatorios |
| 400 | Correo incorrecto | El formato del correo no es válido |
| 400 | Contraseña insuficiente | La contraseña no cumple los requisitos |
| 409 | Correo ya registrado | No se puede registrar ese correo |
| 500 | Error interno | No se ha podido completar el registro |

Los mensajes serán comprensibles para el usuario y no incluirán información interna del servidor.

Para el caso de correo duplicado, se propone utilizar `409 Conflict`. Deben aplicarse medidas para evitar que la consulta de disponibilidad permita enumerar cuentas de forma abusiva.

## 6. Validaciones

### 6.1. Correo electrónico

El servidor deberá comprobar que:

- El campo existe y contiene una cadena de texto.
- No está vacío.
- Su formato es válido.
- No supera la longitud máxima establecida.
- No está asociado a otra cuenta activa.

Se aceptarán direcciones válidas de cualquier dominio.

Se propone normalizar el correo eliminando los espacios exteriores y aplicando una política coherente de comparación sin distinción de mayúsculas.

La validación debe realizarse en el servidor, independientemente de las comprobaciones que pueda efectuar el formulario.

### 6.2. Contraseña

De acuerdo con la decisión del Product Owner, la contraseña deberá:

- Tener al menos 8 caracteres.
- Contener al menos una letra.
- Contener al menos un número.
- No estar vacía.

Como medida adicional de seguridad se propone establecer una longitud máxima razonable y rechazar contraseñas excesivamente grandes, sin modificar los requisitos mínimos confirmados.

La contraseña no deberá incluirse en mensajes de error, respuestas del servidor ni registros de actividad.

### 6.3. Duplicados

El backend comprobará la existencia del correo antes de registrar una cuenta.

Además, la base de datos deberá imponer una restricción de unicidad para evitar duplicados ante peticiones simultáneas.

Si el correo pertenece a una cuenta activa, el registro se rechazará.

El tratamiento de correos asociados a cuentas desactivadas se mantendrá como decisión pendiente de validación.

## 7. Seguridad y almacenamiento de contraseñas

### 7.1. Algoritmo de hash

Se propone utilizar **Argon2id**, mediante una biblioteca mantenida y compatible con Node.js.

Argon2id está diseñado para el almacenamiento seguro de contraseñas y permite ajustar el coste computacional del proceso.

Como alternativa, si la arquitectura del proyecto lo requiere, podría utilizarse bcrypt con una configuración segura.

La elección definitiva de la biblioteca y sus parámetros deberá confirmarse con el equipo.

### 7.2. Procedimiento de almacenamiento

El procedimiento propuesto será:

1. Recibir la contraseña durante el registro mediante una conexión HTTPS.
2. Validar que cumple los requisitos establecidos.
3. Generar un hash mediante Argon2id con una sal aleatoria.
4. Guardar en `password_hash` el resultado codificado que contiene la información necesaria para verificar la contraseña posteriormente.
5. Descartar la contraseña original una vez procesada.
6. Confirmar el registro sin devolver datos sensibles.

No se utilizarán algoritmos rápidos como MD5, SHA-1 o SHA-256 directamente para almacenar contraseñas.

### 7.3. Verificación posterior

Durante el inicio de sesión, el sistema deberá:

1. Localizar la cuenta correspondiente.
2. Obtener el hash almacenado.
3. Utilizar la función de verificación de la biblioteca de contraseñas.
4. Permitir el acceso solamente si las credenciales son válidas y la cuenta está activa.

No será necesario descifrar ninguna contraseña, ya que el hash es un mecanismo no reversible.

### 7.4. Medidas adicionales

Se propone:

- Utilizar HTTPS para transmitir credenciales.
- Evitar registrar contraseñas o hashes en logs.
- Mantener las credenciales de base de datos fuera del código fuente.
- Utilizar variables de entorno para la configuración sensible.
- Limitar las peticiones de registro para reducir abusos.
- Gestionar los errores sin exponer trazas internas del servidor.

## 8. Casos de prueba previstos

El diseño debe permitir a la persona responsable de SCRUM-84 comprobar los siguientes escenarios:

| Prueba | Entrada o situación | Resultado esperado |
|---|---|---|
| Registro válido | Correo nuevo y contraseña válida | Usuario creado, HTTP 201 |
| Correo duplicado | Correo de una cuenta activa | Registro rechazado |
| Correo inválido | Dirección con formato incorrecto | HTTP 400 |
| Contraseña corta | Menos de 8 caracteres | HTTP 400 |
| Contraseña sin letra | Solo números | HTTP 400 |
| Contraseña sin número | Solo letras | HTTP 400 |
| Campos vacíos | Falta correo o contraseña | HTTP 400 |
| Hash seguro | Registro completado | No se guarda texto plano |
| Rol inicial | Registro válido | Rol USUARIO |
| Estado inicial | Registro válido | Cuenta preparada para iniciar sesión |
| Privacidad | Registro y errores | No se exponen contraseñas ni hashes |

Las pruebas deberán utilizar exclusivamente datos ficticios o sintéticos.

## 9. Relación con otras historias de usuario

**US-002 — Inicio de sesión:** utilizará el correo, el hash de contraseña, el rol y el estado de la cuenta definidos en este diseño.

**US-003 — Cierre de sesión:** gestionará la invalidación de sesiones, sin modificar necesariamente la estructura básica del usuario.

**US-005 — Gestión de perfil:** utilizará el identificador del usuario y ampliará los datos del perfil según las reglas establecidas.

**US-004 y US-006 — Recuperación y cambio de contraseña:** deberán reutilizar las reglas de validación y el mecanismo seguro de hash.

**US-007 — Autenticación OAuth:** podría requerir adaptar la obligatoriedad de `password_hash` para cuentas que no utilicen credenciales locales.

## 10. Decisiones técnicas adoptadas y aspectos pendientes

Aunque la tecnología Node.js está confirmada por el equipo, deben revisarse las siguientes propuestas:

1. Utilizar Express.js como framework HTTP.
2. Utilizar PostgreSQL como sistema gestor de base de datos.
3. Aplicar el modelo de tabla `usuarios` descrito.
4. Utilizar `/api/auth/register` como ruta de registro.
5. Utilizar Argon2id como algoritmo de hash.
6. Definir la política de correos pertenecientes a cuentas desactivadas.
7. Confirmar la estructura de carpetas y las convenciones del backend.
8. Confirmar cómo se representarán las cuentas OAuth sin contraseña local.

Estas decisiones deberán comunicarse a los responsables de implementación y pruebas antes de considerarlas definitivas.

## 11. Conclusión

Se ha elaborado el diseño técnico propuesto para el registro de usuarios de Lost&Found UEx, incluyendo el modelo de datos, el contrato del endpoint, las validaciones y el almacenamiento seguro de contraseñas.

El documento incorpora los requisitos de US-001 y las aclaraciones del Product Owner.

Una vez aprobadas las decisiones técnicas pendientes, servirá como referencia para la implementación de SCRUM-83 y las pruebas de SCRUM-84.

**Documento asociado a SCRUM-85 — Diseño técnico de usuario y contraseñas.**
