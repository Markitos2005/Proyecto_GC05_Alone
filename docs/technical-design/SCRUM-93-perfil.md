# SCRUM-93 — Diseño técnico del perfil de usuario

**Proyecto:** Lost&Found UEx
**Historia de usuario:** US-005 — Gestión de perfil e información de contacto (SCRUM-14)
**Subtarea:** SCRUM-93 — Tech Lead: Diseñar el perfil
**Responsable:** Ángel Parra García
**Sprint:** IT-01
**Tecnología:** JavaScript con Node.js y Express.js
**Estado:** Diseño técnico definido por el Tech Lead, sujeto a ajustes de integración

## 1. Objetivo

El objetivo de este documento es definir el diseño técnico de la gestión del perfil de usuario en Lost&Found UEx, correspondiente a la historia US-005.

Se establecerán los campos que forman parte del perfil, cuáles pueden modificarse, las reglas de validación del teléfono y las condiciones de privacidad y acceso.

El diseño servirá como referencia para la implementación de SCRUM-91 y las pruebas de SCRUM-92.

## 2. Requisitos funcionales confirmados

Según los criterios de aceptación de US-005:

- **US-005-AC-01:** El usuario autenticado puede consultar su perfil y modificar los campos permitidos.
- **US-005-AC-02:** El usuario puede añadir, modificar o eliminar su teléfono de contacto.
- **US-005-AC-03:** El sistema valida el formato y los límites de los datos antes de guardarlos.
- **US-005-AC-04:** Un usuario únicamente puede consultar y editar su propio perfil.
- **US-005-AC-05:** La modificación del perfil conserva la identidad, el rol y las publicaciones asociadas a la cuenta.
- **US-005-AC-06:** El sistema proporciona mensajes comprensibles cuando se introducen datos incorrectos o se intenta realizar una operación no autorizada.

Adicionalmente, el teléfono solo podrá mostrarse mediante operaciones y vistas autorizadas.

## 3. Arquitectura técnica

El sistema utilizará JavaScript con Node.js y Express.js para gestionar las peticiones de consulta y modificación del perfil.

La autenticación se realizará utilizando el sistema de sesiones y cookies seguras definido en SCRUM-88.

Se propone separar la lógica en:

- **Rutas:** definición de endpoints HTTP.
- **Controladores:** recepción de peticiones y generación de respuestas.
- **Servicios:** validaciones y reglas del perfil.
- **Persistencia:** acceso a los datos del usuario.
- **Middleware:** comprobación de autenticación y autorización.

### Flujo general

1. El usuario inicia sesión.
2. El navegador envía la cookie de sesión.
3. El backend comprueba que la sesión es válida.
4. Se identifica al usuario mediante la sesión.
5. El sistema consulta sus datos en la base de datos.
6. El usuario puede modificar los campos permitidos.
7. Se validan los datos introducidos.
8. Se actualiza el perfil sin modificar la identidad, el rol ni las publicaciones.
9. El servidor devuelve una respuesta con los datos autorizados.

## 4. Modelo de datos del perfil

El perfil estará asociado al identificador único del usuario definido en SCRUM-85.

Se propone ampliar el modelo `usuarios` sin crear una identidad independiente.

### Campos del perfil

| Campo | Tipo propuesto | Editable | Obligatorio |
|---|---|---|---|
| id | UUID | No | Sí |
| email | VARCHAR(254) | No | Sí |
| nombre | VARCHAR(100) | Sí | Sí |
| apellidos | VARCHAR(150) | Sí | Sí |
| telefono | VARCHAR(12) | Sí | No |
| rol | VARCHAR(20) | No | Sí |
| activo | BOOLEAN | No | Sí |
| created_at | TIMESTAMP | No | Sí |
| updated_at | TIMESTAMP | No | Sí |

### Decisiones técnicas

**Identificador:** será el mismo UUID utilizado durante el registro.

**Correo electrónico:** se mantendrá como dato de identidad y no podrá modificarse mediante los endpoints de perfil definidos para US-005.

**Nombre:** campo obligatorio y editable por el propietario del perfil. No podrá guardarse vacío.

**Apellidos:** campo obligatorio y editable por el propietario del perfil. No podrán guardarse vacíos.

**Teléfono:** será opcional. El usuario podrá añadirlo, modificarlo o eliminarlo.

**Rol:** no podrá modificarse desde el perfil.

**Estado:** el usuario no podrá activar o desactivar su propia cuenta mediante estos endpoints.

**Fechas:** se actualizará `updated_at` cuando se realicen cambios.

El modelo deberá mantener la compatibilidad con las publicaciones y relaciones existentes.

## 5. Formato y validación del teléfono

Según las aclaraciones del Product Owner, el teléfono
debe contener 9 cifras y puede incluir opcionalmente
el prefijo internacional +34.

### Reglas confirmadas

- El teléfono es un campo opcional.
- Se admiten números de 9 cifras.
- Se permite añadir +34 delante del número.
- No es obligatorio incluir +34.
- No es necesario admitir números de otros países.
- El usuario puede añadir, modificar o eliminar su teléfono.

### Ejemplos

| Teléfono | Resultado |
|---|---|
| 612345678 | Válido |
| +34612345678 | Válido |
| 912345678 | Válido |
| 12345 | Inválido |
| +441234567890 | Inválido |
| abc123 | Inválido |
| null | Permitido: sin teléfono |

### Validación técnica

Se propone utilizar la siguiente expresión regular:

`^(?:\+34)?[0-9]{9}$`


La expresión regular se aplicará únicamente cuando el teléfono contenga un valor.
Si el usuario envía `telefono: null`, el sistema interpretará que desea eliminar su teléfono de contacto.
En ese caso no se aplicará la expresión regular y el valor se almacenará como NULL en la base de datos.


Esta expresión comprueba que el número tenga exactamente
9 cifras y que pueda comenzar opcionalmente por +34.

La validación se realizará en el servidor.

## 6. Endpoint de consulta del perfil

### Endpoint adoptado

**Método HTTP:** GET
**Ruta:** `/api/profile/me`
**Autenticación:** Obligatoria mediante sesión.

El servidor identificará al usuario desde la sesión autenticada.

No será necesario enviar un identificador de usuario en la URL.

### Respuesta correcta

**Código HTTP:** 200 OK

Ejemplo:

```json
{
  "id": "uuid-del-usuario",
  "email": "usuario@example.com",
  "nombre": "Usuario",
  "apellidos": "Ejemplo García",
  "telefono": "612345678",
  "rol": "USUARIO"
}
```

Los datos se devolverán únicamente al propietario autenticado.

No se incluirán contraseñas, hashes, secretos de sesión ni información interna.

### Errores

| Código | Situación |
|---|---|
| 401 | No existe una sesión autenticada válida |
| 403 | El usuario carece de autorización |
| 404 | No existe el recurso solicitado |
| 500 | Error interno del servidor |

## 7. Endpoint de actualización del perfil

### Endpoint adoptado

**Método HTTP:** PATCH
**Ruta:** `/api/profile/me`
**Autenticación:** Obligatoria mediante sesión.
**Formato:** JSON.

Se utilizará `PATCH` porque permite modificar únicamente los campos indicados.

### Campos editables

Se permitirá modificar:

- `nombre`, campo obligatorio.
- `apellidos`, campo obligatorio.
- `telefono`, campo opcional.

### Actualización parcial de campos

El endpoint PATCH permitirá actualizar únicamente los campos incluidos en la petición.

Aunque nombre y apellidos son obligatorios en el perfil, no será necesario enviarlos en todas las peticiones de actualización.

Si se incluye nombre o apellidos, su valor no podrá ser nulo, vacío ni contener únicamente espacios.

Los campos omitidos conservarán su valor anterior.

No se permitirá modificar directamente:

- `id`.
- `email`.
- `rol`.
- `activo`.
- `created_at`.

### Ejemplo de petición

```json
{
  "nombre": "Usuario",
  "apellidos": "Ejemplo García",
  "telefono": "612345678"
}
```

### Respuesta correcta

**Código HTTP:** 200 OK

```json
{
  "message": "Perfil actualizado correctamente",
  "profile": {
    "id": "uuid-del-usuario",
    "email": "usuario@example.com",
    "nombre": "Usuario",
    "apellidos": "Ejemplo García",
    "telefono": "612345678"
  }
}
```

La actualización deberá realizarse únicamente sobre el usuario identificado mediante la sesión.

No se confiará en un identificador de usuario proporcionado por el cliente para decidir qué perfil actualizar.

## 8. Eliminación del teléfono

El usuario podrá eliminar su teléfono mediante una petición de actualización.

Se propone utilizar:

```json
{
  "telefono": null
}
```

El servidor interpretará `null` como una solicitud explícita de eliminación.

Si el campo `telefono` no aparece en la petición, el valor almacenado permanecerá sin cambios.

Tras la eliminación, el número dejará de mostrarse en el perfil.

La eliminación del teléfono no afectará al resto de datos de la cuenta.

## 9. Privacidad y visibilidad de los datos

### Política de acceso

Se adopta como política inicial que **solo el propietario autenticado podrá consultar y modificar su perfil privado**.

El servidor utilizará el identificador de usuario almacenado en la sesión.

### Protección del teléfono

El teléfono se considera información de contacto privada.

Solo se mostrará:

- Al propietario, dentro de su perfil.
- En otras operaciones expresamente autorizadas por los requisitos del sistema.

No se expondrá automáticamente en listados públicos ni en respuestas de API ajenas al perfil.

### Control de acceso

El middleware de autenticación comprobará que:

1. Existe una sesión válida.
2. La cuenta está activa.
3. La operación está autorizada.
4. Los datos solicitados pertenecen al usuario autenticado.

El backend rechazará cualquier intento de modificar perfiles ajenos.

Los permisos se comprobarán en el servidor y no únicamente mediante controles visuales del frontend.

## 10. Validaciones y errores

### Validación de campos

Se comprobará que:

- Los campos enviados están permitidos.
- Los valores tienen el tipo correcto.
- Los textos cumplen los límites de longitud.
- El teléfono presenta un formato válido.
- No se intenta modificar información protegida.

Se propone rechazar las propiedades no admitidas para evitar modificaciones indebidas.

### Respuestas de error

| Código HTTP | Situación | Mensaje |
|---|---|---|
| 400 | Datos inválidos | Los datos del perfil no son válidos |
| 401 | Sesión inexistente o caducada | Debes iniciar sesión |
| 403 | Operación no autorizada | No tienes permiso para realizar esta operación |
| 404 | Perfil inexistente | No se ha encontrado el perfil |
| 500 | Error interno | No se ha podido completar la operación |

Los errores no incluirán información interna del servidor ni datos personales innecesarios.

## 11. Seguridad

Se adoptarán las siguientes medidas:

- Autenticación obligatoria mediante sesiones y cookies seguras.
- Protección CSRF para las operaciones de modificación.
- Identificación del usuario desde la sesión.
- Validación de los datos en el backend.
- Prohibición de modificar el rol desde el perfil.
- Protección frente a modificación masiva de campos no autorizados.
- Exclusión de contraseñas y hashes de las respuestas.
- Uso de HTTPS.
- Control de acceso sobre los datos personales.
- Protección de la información de contacto.
- Conservación de las relaciones con publicaciones existentes.

## 12. Relación con otras historias

### US-001 — Registro de usuarios

El perfil utilizará el identificador y la estructura de usuarios definidos en SCRUM-85.

### US-002 — Inicio de sesión

La autenticación se realizará mediante el sistema de sesiones y cookies definido en SCRUM-88.

### US-003 — Cierre de sesión

Después de cerrar sesión, el usuario no podrá consultar ni modificar su perfil privado.

### US-006 — Cambio de contraseña

El cambio de contraseña será una funcionalidad independiente y no formará parte de los campos editables de US-005.


## 13. Casos de prueba previstos

Se deberán verificar los siguientes escenarios:

| Caso de prueba | Resultado esperado |
|---|---|
| Consultar perfil autenticado | HTTP 200 |
| Consultar perfil sin sesión | HTTP 401 |
| Modificar nombre válido | Actualización correcta |
| Modificar apellidos válidos | Actualización correcta |
| Nombre vacío | HTTP 400 |
| Apellidos vacíos | HTTP 400 |
| Añadir teléfono de 9 cifras (612345678) | Teléfono aceptado |
| Añadir teléfono con +34 (+34612345678) | Teléfono aceptado |
| Introducir teléfono de menos de 9 cifras | HTTP 400 |
| Introducir teléfono de más de 9 cifras sin prefijo | HTTP 400 |
| Introducir teléfono con prefijo extranjero | HTTP 400 |
| Introducir caracteres no numéricos en el teléfono | HTTP 400 |
| Cambiar teléfono | Nuevo valor almacenado |
| Eliminar teléfono | Valor NULL |
| Introducir datos demasiado largos | HTTP 400 |
| Intentar modificar el correo electrónico | Operación rechazada |
| Intentar modificar el rol | Operación rechazada |
| Intentar modificar el identificador | Operación rechazada |
| Intentar modificar un perfil ajeno | Acceso denegado |
| Consultar perfil después de cerrar sesión | HTTP 401 |
| Editar perfil | Identidad, rol y publicaciones conservadas |
| Consultar teléfono sin autorización | Información no revelada |

Las pruebas deberán utilizar únicamente datos ficticios o sintéticos.

Se comprobará especialmente que el nombre y los apellidos sean obligatorios, que el teléfono acepte exactamente 9 cifras con el prefijo +34 opcional y que ningún usuario pueda consultar o modificar el perfil privado de otro.


## 14. Decisiones técnicas adoptadas y aspectos pendientes

### Decisiones adoptadas

- Utilizar JavaScript con Node.js y Express.js.
- Asociar el perfil al identificador UUID del usuario.
- Mantener el correo electrónico como campo no editable.
- Establecer el nombre como campo obligatorio y editable.
- Establecer los apellidos como campo obligatorio y editable.
- Permitir añadir, modificar y eliminar el teléfono de contacto.
- Admitir teléfonos de exactamente 9 cifras.
- Permitir opcionalmente el prefijo internacional +34.
- Aceptar números como 612345678 sin exigir el prefijo +34.
- No requerir compatibilidad con números de otros países.
- Validar el teléfono en el backend mediante la expresión regular `^(?:\+34)?[0-9]{9}$`.
- Utilizar GET /api/profile/me para consultar el perfil.
- Utilizar PATCH /api/profile/me para actualizar los campos permitidos.
- Proteger las operaciones mediante sesiones autenticadas.
- Impedir que un usuario consulte o modifique el perfil privado de otro usuario.
- Mantener el teléfono privado por defecto.
- Impedir la modificación del rol y del identificador desde el perfil.
- Conservar la identidad y las publicaciones asociadas al usuario.

### Aspectos pendientes de integración

- Confirmar el modelo físico definitivo de la base de datos.
- Incorporar los campos nombre y apellidos a la implementación del perfil.
- Adaptar los endpoints a la estructura real del backend.
- Confirmar la configuración definitiva de autenticación y autorización.
- Definir qué operaciones de contacto podrán mostrar el teléfono a terceros autorizados.
- Coordinar la implementación de SCRUM-91 y las pruebas de SCRUM-92.

### Aclaraciones del Product Owner incorporadas

El diseño se ha actualizado para reflejar las decisiones funcionales establecidas en US-005:

1. Los campos editables son nombre, apellidos y teléfono.
2. El nombre y los apellidos son obligatorios.
3. El teléfono es opcional y debe contener 9 cifras.
4. Se permite añadir el prefijo +34, pero no es obligatorio.
5. No es necesario admitir números de otros países.
6. El correo electrónico no puede modificarse desde el perfil.

Estas aclaraciones prevalecen sobre las propuestas anteriores del diseño técnico.

## 15. Conclusión

Se ha definido el diseño técnico de la gestión del perfil de usuario correspondiente a US-005.

El diseño establece los campos del perfil, el formato y las validaciones del teléfono, los endpoints de consulta y edición y los controles de privacidad y autorización.

La solución mantiene la compatibilidad con el registro y la autenticación definidos en SCRUM-85 y SCRUM-88.

El documento servirá como referencia para la implementación de SCRUM-91 y la verificación mediante SCRUM-92.

**Documento asociado a SCRUM-93 — Diseño técnico del perfil de usuario.**
