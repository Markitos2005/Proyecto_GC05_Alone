# SCRUM-88 — Diseño técnico del inicio de sesión

**Proyecto:** Lost&Found UEx  
**Historia de usuario:** US-002 — Inicio de sesión (SCRUM-11)  
**Subtarea:** SCRUM-88 — Tech Lead: Diseñar la sesión  
**Responsable:** Ángel Parra García  
**Sprint:** IT-01  
**Tecnología:** JavaScript con Node.js  
**Estado:** Diseño técnico definido por el Tech Lead, sujeto a ajustes de integración

## 1. Objetivo

El objetivo de este documento es definir el diseño técnico del sistema de inicio de sesión de Lost&Found UEx, correspondiente a la historia US-002.

Se establece cómo se autentican los usuarios mediante correo electrónico y contraseña, cómo se crea y almacena una sesión, qué mecanismos de seguridad se utilizan y cómo se comprueban los permisos de acceso.

El diseño servirá como referencia para la implementación de SCRUM-86 y las pruebas de SCRUM-87.

## 2. Requisitos funcionales confirmados

Según los criterios de aceptación de US-002:

- **US-002-AC-01:** El usuario puede iniciar sesión introduciendo las credenciales de una cuenta registrada.
- **US-002-AC-02:** Las credenciales válidas crean una sesión autenticada y permiten acceder a las operaciones autorizadas.
- **US-002-AC-03:** Se rechazan contraseñas incorrectas, cuentas inexistentes y cuentas desactivadas.
- **US-002-AC-04:** El sistema no revela si un correo existe cuando las credenciales son incorrectas.
- **US-002-AC-05:** La sesión identifica al usuario autenticado y permite aplicar sus permisos.

También se requiere que las credenciales no aparezcan en los registros de actividad ni en las respuestas de la API.

## 3. Arquitectura técnica

Se adopta una arquitectura cliente-servidor con backend desarrollado mediante Node.js.

Se propone utilizar Express.js para las rutas HTTP y middleware de autenticación y autorización.

Se selecciona un mecanismo de sesiones almacenadas en el servidor, identificadas mediante cookies seguras.

Las sesiones permitirán mantener la autenticación entre diferentes peticiones HTTP sin solicitar las credenciales constantemente.

### Flujo general

1. El usuario introduce su correo electrónico y contraseña.
2. El cliente envía las credenciales al backend mediante HTTPS.
3. El servidor valida los datos recibidos.
4. Se busca la cuenta correspondiente en la base de datos.
5. Se comprueba que la cuenta está activa.
6. Se verifica la contraseña mediante el hash almacenado.
7. Si las credenciales son correctas, se crea una nueva sesión autenticada.
8. El servidor almacena la sesión y entrega al navegador una cookie segura.
9. En futuras peticiones, el servidor identifica al usuario a partir de la sesión.
10. Si la sesión es inválida o el usuario carece de permisos, se rechaza el acceso.

## 4. Endpoint de inicio de sesión

### Endpoint adoptado

**Método HTTP:** POST  
**Ruta:** `/api/auth/login`  
**Formato de entrada:** JSON  
**Autenticación previa:** No requerida

### Datos de entrada

| Campo | Tipo | Obligatorio |
|---|---|---|
| email | string | Sí |
| password | string | Sí |

Ejemplo de solicitud:

```json
{
  "email": "usuario@example.com",
  "password": "Prueba1234"
}
```

Se utilizarán únicamente credenciales ficticias durante las pruebas.

### Respuesta correcta

**Código HTTP:** 200 OK

Ejemplo:

```json
{
  "message": "Inicio de sesión correcto",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@example.com",
    "rol": "USUARIO"
  }
}
```

La cookie de sesión se entregará mediante la cabecera HTTP `Set-Cookie`.

La respuesta nunca incluirá la contraseña, su hash ni el identificador secreto de la sesión dentro del cuerpo JSON.

### Respuestas de error

| Código | Situación | Respuesta |
|---|---|---|
| 400 | Campos ausentes o inválidos | Datos de acceso inválidos |
| 401 | Correo inexistente | Credenciales incorrectas |
| 401 | Contraseña incorrecta | Credenciales incorrectas |
| 401 | Cuenta desactivada | Credenciales incorrectas |
| 429 | Demasiados intentos | Demasiados intentos. Inténtalo más tarde |
| 500 | Error interno | No se ha podido completar la operación |

Se utilizará un mensaje genérico para los fallos de autenticación con el fin de evitar revelar si el correo pertenece a una cuenta existente.

## 5. Estrategia de gestión de sesiones

### 5.1. Mecanismo seleccionado

Se utilizarán sesiones gestionadas en el servidor mediante cookies HTTP.

El cliente no almacenará contraseñas ni tokens de autenticación en `localStorage`.

El navegador conservará únicamente una cookie que identifica la sesión.

### 5.2. Creación de sesiones

Cuando las credenciales sean correctas:

1. Se invalidará o regenerará cualquier identificador de sesión anterior para evitar ataques de fijación de sesión.
2. Se creará una nueva sesión autenticada.
3. Se asociará la sesión al identificador del usuario.
4. Se almacenará la información de sesión en un repositorio del servidor.
5. Se enviará al navegador una cookie con el identificador de sesión.

La sesión no contendrá contraseñas ni hashes.

### 5.3. Almacenamiento

Se propone utilizar `express-session` para gestionar sesiones en Node.js.

En un entorno de ejecución real, las sesiones se almacenarán en un repositorio compartido y persistente, como Redis o un almacén compatible con PostgreSQL.

No se utilizará `MemoryStore` como mecanismo de producción.

La elección definitiva del almacén dependerá de la infraestructura disponible.

### 5.4. Caducidad

Se propone una duración máxima inicial de 30 minutos de inactividad.

La sesión deberá caducar al alcanzar el tiempo establecido o cuando sea invalidada explícitamente.

La política definitiva de expiración podrá ajustarse a los requisitos del sistema.

## 6. Seguridad de las cookies

Se establecerán los siguientes atributos de seguridad:

| Atributo | Configuración |
|---|---|
| HttpOnly | true |
| Secure | true en HTTPS |
| SameSite | Lax, salvo necesidades justificadas |
| Path | / |
| Max-Age | Según política de sesión |

### HttpOnly

Impide que JavaScript del navegador pueda leer directamente la cookie de sesión.

### Secure

Hace que la cookie solamente se transmita mediante conexiones HTTPS.

### SameSite

Se propone `Lax` para reducir el riesgo de envío de cookies en determinadas solicitudes entre sitios.

Esta configuración no sustituye la protección contra ataques CSRF.

### Protección adicional

Se deberá aplicar protección CSRF a las operaciones que modifican datos cuando se utilice autenticación basada en cookies.

También se deberán configurar correctamente CORS, el uso de HTTPS y los proxies de confianza cuando correspondan.

## 7. Verificación de contraseñas

El inicio de sesión reutilizará el modelo de usuarios establecido en SCRUM-85.

Las contraseñas se verificarán utilizando el algoritmo Argon2id propuesto en el diseño del registro.

### Procedimiento

1. Normalizar el correo según las mismas reglas utilizadas en el registro.
2. Buscar la cuenta correspondiente.
3. Obtener el hash de contraseña almacenado.
4. Verificar la contraseña introducida mediante la biblioteca Argon2id.
5. Comprobar que la cuenta está activa.
6. Crear la sesión únicamente cuando todas las comprobaciones sean correctas.

Las contraseñas no se descifrarán ni se compararán como texto plano.

Se deberán aplicar medidas contra ataques de fuerza bruta y evitar diferencias de comportamiento que permitan identificar cuentas existentes.

## 8. Control de autenticación y permisos

Se utilizará middleware de Express.js para proteger las rutas privadas.

### 8.1. Middleware de autenticación

El middleware comprobará:

- Que la petición contiene una cookie de sesión válida.
- Que la sesión existe y no ha caducado.
- Que está asociada a un usuario registrado.
- Que la cuenta continúa activa.

Si alguna comprobación falla, devolverá:

**HTTP 401 — No autenticado.**

### 8.2. Middleware de autorización

Una vez autenticado, el servidor verificará que el usuario tiene los permisos necesarios para acceder al recurso solicitado.

Se utilizarán los roles definidos en el sistema:

- **USUARIO:** acceso a las operaciones permitidas para usuarios registrados.
- **ADMINISTRADOR:** acceso a las operaciones administrativas autorizadas.

Los permisos deberán comprobarse en el servidor, no únicamente en el frontend.

### 8.3. Protección de recursos propios

Para acceder a información privada, el backend verificará también que el usuario autenticado es el propietario del recurso o dispone de autorización específica.

Por ejemplo, un usuario no podrá editar el perfil privado de otra persona simplemente modificando el identificador incluido en una petición.

## 9. Seguridad adicional

Se establecen las siguientes medidas:

- Uso de HTTPS para la transmisión de credenciales.
- Protección frente a intentos repetidos de inicio de sesión.
- Almacenamiento seguro del secreto utilizado para firmar cookies.
- Configuración sensible mediante variables de entorno.
- Ausencia de contraseñas, hashes e identificadores secretos de sesión en logs.
- Mensajes de autenticación genéricos.
- Regeneración del identificador de sesión tras autenticarse.
- Invalidación de la sesión al cerrar sesión.
- Rechazo de sesiones caducadas.
- Protección CSRF para operaciones autenticadas mediante cookies.

## 10. Relación con otras historias

### US-001 — Registro de usuarios

El inicio de sesión utilizará la tabla de usuarios, el correo normalizado, el hash de contraseña, el rol y el estado de cuenta establecidos en SCRUM-85.

### US-003 — Cierre de sesión

La estrategia adoptada permitirá implementar el cierre de sesión mediante la invalidación de la sesión almacenada en el servidor y la eliminación de la cookie del navegador.

### US-005 — Gestión de perfil

La sesión permitirá identificar al usuario autenticado y comprobar que únicamente consulta o modifica los datos de su propio perfil.

## 11. Casos de prueba previstos

El diseño permitirá verificar:

| Caso | Resultado esperado |
|---|---|
| Correo y contraseña correctos | Inicio de sesión correcto |
| Contraseña incorrecta | HTTP 401 |
| Correo inexistente | HTTP 401, mismo mensaje |
| Cuenta desactivada | Acceso rechazado |
| Campos vacíos | HTTP 400 |
| Sesión válida | Acceso a recursos autorizados |
| Sesión inexistente | HTTP 401 |
| Sesión caducada | HTTP 401 |
| Usuario sin permisos | HTTP 403 |
| Acceso al perfil de otro usuario | Acceso denegado |
| Intentos excesivos | Limitación temporal |
| Inicio de sesión correcto | Cookie segura y sesión creada |

Las pruebas deberán utilizar datos ficticios o sintéticos.

## 12. Decisiones técnicas adoptadas y aspectos pendientes

### Decisiones de diseño

- Utilizar JavaScript con Node.js.
- Proponer Express.js como framework HTTP.
- Utilizar sesiones gestionadas en el servidor.
- Identificar las sesiones mediante cookies seguras.
- Adoptar `/api/auth/login` como endpoint de inicio de sesión.
- Utilizar Argon2id para verificar contraseñas, siguiendo SCRUM-85.
- Aplicar middleware para autenticación y autorización.
- Utilizar mensajes genéricos ante credenciales incorrectas.

### Aspectos pendientes de integración

- Confirmar el gestor de base de datos definitivo.
- Seleccionar el almacén persistente de sesiones.
- Adaptar los nombres de campos y rutas a la implementación real.
- Configurar la duración definitiva de las sesiones.
- Comprobar la compatibilidad con la implementación de SCRUM-83.
- Definir los detalles de despliegue HTTPS y CORS según la arquitectura del frontend.

## 13. Conclusión

Se ha definido el diseño técnico de autenticación y gestión de sesiones para la historia US-002 de Lost&Found UEx.

La solución utiliza sesiones mantenidas en el servidor mediante cookies seguras, verificación de contraseñas con Argon2id y mecanismos de control de autenticación y permisos.

El diseño ofrece una base para implementar SCRUM-86 y verificar su funcionamiento mediante SCRUM-87.

**Documento asociado a SCRUM-88 — Diseño técnico del inicio de sesión.**
