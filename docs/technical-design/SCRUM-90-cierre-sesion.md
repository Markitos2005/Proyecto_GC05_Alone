# SCRUM-90 — Diseño técnico del cierre de sesión

**Proyecto:** Lost&Found UEx  
**Historia de usuario:** US-003 — Cierre de sesión (SCRUM-12)  
**Subtarea:** SCRUM-90 — Tech Lead: Diseñar el cierre de sesión  
**Responsable:** Ángel Parra García  
**Sprint:** IT-01  
**Tecnología:** JavaScript con Node.js y Express.js  
**Estado:** Diseño técnico definido por el Tech Lead, sujeto a ajustes de integración

## 1. Objetivo

El objetivo de este documento es definir el diseño técnico del cierre de sesión de usuarios en Lost&Found UEx, correspondiente a la historia US-003.

Se establece cómo invalidar una sesión autenticada, eliminar la cookie asociada e impedir el acceso a recursos privados después de cerrar sesión.

El diseño será compatible con el mecanismo de autenticación definido en SCRUM-88, basado en sesiones almacenadas en el servidor y cookies HTTP seguras.

Servirá como referencia para la implementación del cierre de sesión y las pruebas correspondientes a SCRUM-89.

## 2. Requisitos funcionales confirmados

Según los criterios de aceptación de US-003:

- **US-003-AC-01:** El usuario autenticado puede iniciar el cierre de sesión.
- **US-003-AC-02:** El cierre invalida la sesión y las credenciales temporales asociadas según la estrategia de autenticación utilizada.
- **US-003-AC-03:** Una sesión cerrada no permite acceder a operaciones autenticadas.
- **US-003-AC-04:** El sistema informa de forma comprensible cuando se intenta utilizar una sesión cerrada.
- **US-003-AC-05:** El cierre de sesión no elimina la cuenta ni las publicaciones del usuario.

El sistema deberá permitir un nuevo inicio de sesión después del cierre.

## 3. Arquitectura técnica

Se utilizará Node.js con Express.js, manteniendo la arquitectura definida para el inicio de sesión.

La autenticación se basará en sesiones almacenadas en el servidor e identificadas mediante cookies seguras.

Se adopta la invalidación de sesiones en el servidor como mecanismo principal de cierre.

No será suficiente eliminar únicamente la cookie del navegador, ya que la sesión almacenada en el servidor también deberá quedar invalidada.

### Flujo general

1. El usuario autenticado selecciona la opción de cerrar sesión.
2. El cliente envía una petición al endpoint de cierre.
3. El servidor identifica la sesión actual.
4. Se invalida la sesión en el almacén del servidor.
5. Se envía una respuesta que elimina la cookie de sesión del navegador.
6. El cliente elimina los datos de autenticación que mantenga en memoria.
7. El usuario vuelve a la pantalla pública o de inicio de sesión.
8. Cualquier intento posterior de utilizar la sesión invalidada será rechazado.

## 4. Endpoint de cierre de sesión

### Endpoint adoptado

**Método HTTP:** POST  
**Ruta:** `/api/auth/logout`  
**Autenticación:** Sesión previamente autenticada  
**Formato de respuesta:** JSON

El endpoint utilizará el mismo mecanismo de cookies que el inicio de sesión.

No será necesario enviar el correo ni la contraseña para cerrar sesión.

### Petición

La petición utilizará la cookie de sesión enviada automáticamente por el navegador.

No se requerirá un cuerpo JSON.

Las solicitudes de cierre deberán contar con la protección CSRF correspondiente al mecanismo de autenticación por cookies.

### Respuesta correcta

**Código HTTP:** 200 OK

Ejemplo de respuesta:

```json
{
  "message": "Sesión cerrada correctamente"
}
```

El servidor también enviará una cabecera `Set-Cookie` para eliminar la cookie de sesión.

No se incluirán identificadores de sesión ni información sensible en la respuesta.

## 5. Invalidación de la sesión

### 5.1. Mecanismo seleccionado

Se utilizará la invalidación de sesiones gestionadas en el servidor.

Si se utiliza `express-session`, se empleará el mecanismo proporcionado por la biblioteca para destruir la sesión actual.

### 5.2. Procedimiento

El servidor deberá:

1. Recuperar la sesión asociada a la petición.
2. Identificar el registro correspondiente en el almacén de sesiones.
3. Destruir o invalidar dicho registro.
4. Comprobar el resultado de la operación.
5. Enviar la instrucción de eliminación de la cookie.
6. Devolver una respuesta de confirmación.

La respuesta de éxito no deberá emitirse antes de confirmar que la invalidación ha finalizado correctamente.

### 5.3. Persistencia

La sesión deberá eliminarse o invalidarse en el almacén utilizado por el sistema, independientemente de si se utiliza Redis, PostgreSQL u otro mecanismo compatible.

El diseño no dependerá exclusivamente del almacenamiento de sesiones en memoria.

### 5.4. Alcance del cierre

Se adopta como comportamiento inicial el cierre de la sesión actual.

No se invalidarán automáticamente las demás sesiones del usuario, salvo que otra funcionalidad lo requiera expresamente.

Este comportamiento podrá ampliarse en futuras historias relacionadas con el cambio o recuperación de contraseñas.

## 6. Eliminación de la cookie

Después de invalidar la sesión, el backend enviará al navegador una instrucción para eliminar la cookie asociada.

Si se utiliza Express.js, podrá emplearse `res.clearCookie()`.

La eliminación deberá utilizar el mismo nombre y los atributos de ámbito relevantes con los que se creó la cookie, especialmente `Path` y, si corresponde, `Domain`.

La cookie mantendrá la configuración de seguridad establecida en SCRUM-88:

- HttpOnly.
- Secure en conexiones HTTPS.
- SameSite según la política adoptada.
- Path correspondiente al ámbito de autenticación.

La eliminación de la cookie es complementaria a la invalidación en el servidor.

## 7. Control de acceso después del cierre

Las rutas protegidas utilizarán el middleware de autenticación definido en SCRUM-88.

Después de cerrar sesión:

1. La sesión anterior dejará de existir o estará marcada como inválida.
2. Una petición posterior con el identificador antiguo no recuperará una sesión autenticada.
3. El middleware rechazará las operaciones privadas.
4. El sistema devolverá una respuesta HTTP 401 cuando no exista una sesión válida.

### Respuesta propuesta

**Código HTTP:** 401 Unauthorized

```json
{
  "message": "Debes iniciar sesión para acceder a este recurso"
}
```

Las operaciones públicas seguirán funcionando sin autenticación.

El frontend también deberá eliminar cualquier información de usuario autenticado conservada en memoria.

Los recursos privados no deberán mantenerse accesibles mediante información almacenada indebidamente en caché.

## 8. Tratamiento de errores

Se establecen los siguientes comportamientos:

| Situación | Resultado esperado |
|---|---|
| Sesión válida | Se invalida y se elimina la cookie |
| Sesión ya cerrada | No se restaura ninguna sesión |
| Sesión caducada | Se mantiene el estado no autenticado |
| Cookie inexistente | No se crea ninguna sesión autenticada |
| Error del almacén de sesiones | Se informa de un error sin exponer datos internos |
| Acceso privado posterior al cierre | HTTP 401 |

### Sesión inexistente o caducada

Se propone que el cierre de sesión sea una operación idempotente desde el punto de vista funcional.

Si el usuario ya no dispone de una sesión válida, el sistema podrá responder con una confirmación genérica de que no existe una sesión activa.

Esto evita proporcionar información innecesaria sobre el estado interno de la autenticación.

### Error al invalidar

Si el almacén devuelve un error y no se puede confirmar la invalidación de una sesión todavía válida, el servidor no deberá declarar que el cierre se ha completado correctamente.

Se devolverá un error genérico, sin exponer identificadores de sesión ni información del servidor.

## 9. Seguridad

Se adoptarán las siguientes medidas:

- Invalidar la sesión en el servidor antes de confirmar el cierre.
- Eliminar la cookie de autenticación.
- Utilizar HTTPS.
- Mantener cookies HttpOnly y Secure.
- Proteger el endpoint frente a CSRF.
- Impedir la reutilización de sesiones invalidadas.
- Evitar mostrar identificadores de sesión en logs o respuestas.
- No eliminar ni modificar la cuenta del usuario durante el cierre.
- No eliminar publicaciones ni datos persistentes del perfil.
- No introducir nuevas credenciales de autenticación durante el cierre.

## 10. Relación con otras historias

### US-001 — Registro de usuarios

El cierre de sesión no modificará la tabla de usuarios ni los hashes de contraseña definidos en SCRUM-85.

### US-002 — Inicio de sesión

El cierre utilizará el mecanismo de sesiones y cookies definido en SCRUM-88.

Las sesiones creadas durante el inicio de sesión deberán poder invalidarse mediante el endpoint de cierre.

### US-005 — Gestión del perfil

Después de cerrar sesión, el usuario no podrá acceder a las operaciones privadas de consulta o modificación de su perfil.

### US-004 y US-006 — Recuperación y cambio de contraseña

Estas funcionalidades podrán reutilizar el mecanismo de invalidación para cerrar otras sesiones del usuario cuando corresponda.

## 11. Casos de prueba previstos

Se deberán verificar los siguientes escenarios:

| Caso | Resultado esperado |
|---|---|
| Cierre con sesión válida | HTTP 200 y sesión invalidada |
| Acceso privado después del cierre | HTTP 401 |
| Reutilización de cookie anterior | Acceso rechazado |
| Cierre con sesión caducada | No se reactiva la sesión |
| Cierre repetido | No se crea una nueva sesión |
| Nuevo inicio de sesión | Se permite con credenciales válidas |
| Datos del usuario | Se mantienen sin cambios |
| Publicaciones del usuario | No se eliminan |
| Fallo del almacén de sesiones | No se confirma falsamente el cierre |
| Petición sin protección CSRF válida | Rechazada según la política de seguridad |

Las pruebas utilizarán únicamente datos ficticios o sintéticos.

## 12. Decisiones técnicas adoptadas y aspectos pendientes

### Decisiones adoptadas

- Utilizar Node.js y Express.js.
- Mantener sesiones gestionadas en el servidor.
- Identificar las sesiones mediante cookies seguras.
- Utilizar `POST /api/auth/logout` para cerrar sesión.
- Invalidar la sesión en su almacén.
- Eliminar la cookie mediante una respuesta HTTP.
- Rechazar el acceso a zonas privadas después del cierre.
- Mantener intactos los datos y publicaciones del usuario.

### Aspectos pendientes de integración

- Confirmar el nombre definitivo de la cookie de sesión.
- Seleccionar el almacén persistente utilizado por la implementación.
- Ajustar las opciones de cookie al entorno de despliegue.
- Confirmar el mecanismo CSRF utilizado.
- Verificar la compatibilidad con la implementación real de SCRUM-88.
- Coordinar las pruebas funcionales de SCRUM-89.

## 13. Conclusión

Se ha definido el diseño técnico del cierre de sesión correspondiente a US-003.

La solución utiliza la invalidación de sesiones en el servidor y la eliminación de cookies seguras para garantizar que un usuario no pueda continuar accediendo a recursos autenticados después de cerrar sesión.

El diseño mantiene la compatibilidad con el sistema de inicio de sesión definido en SCRUM-88 y establece las condiciones necesarias para su implementación y verificación.

**Documento asociado a SCRUM-90 — Diseño técnico del cierre de sesión.**
