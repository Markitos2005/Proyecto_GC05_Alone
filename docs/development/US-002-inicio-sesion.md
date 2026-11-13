# US-002 · Frontend de inicio de sesión (SCRUM-86)

Implementación React y JavaScript siguiendo el diseño de Ángel en
`docs/technical-design/SCRUM-88-inicio-sesion.md`. Conserva Vite, los estilos
del registro y el backend Express existentes. No añade dependencias.

## Probar la pantalla

Ejecutar `npm.cmd run dev` con la configuración del registro.
Abrir la dirección que indique Vite y pulsar «Iniciar sesión» desde registro,
o añadir `#inicio-sesion` a esa dirección. `#registro` vuelve al registro.
Con el monolito: `npm.cmd run build`, `npm.cmd start` y
`http://localhost:3000/#inicio-sesion`.

La pantalla envía peticiones reales. Mientras no exista la API, mostrará que
el servicio no está disponible (404) o el error de conexión correspondiente.
No incluye cuentas, sesiones ni accesos correctos simulados en la aplicación.

## Conexión para Ángel · SCRUM-38

- `client/src/api/login.js` centraliza la petición `POST /api/auth/login`.
- Entrada JSON: `{ email, password }`. El correo se recorta y convierte a
  minúsculas. La contraseña se envía sin modificar; no se aplica hash en React.
- Respuesta HTTP 200: `{ message, user: { id, email, rol } }`, con campos
  de usuario de tipo string. El servidor crea la sesión y entrega `Set-Cookie`.
- Se envían cookies con `credentials: 'same-origin'`: Vite ya redirige `/api`
  al servidor y el monolito utiliza el mismo origen. Si se decide separar
  los orígenes, habrá que acordar CORS y cookies antes de cambiar esta opción.
- La API debe verificar `usuarios.password_hash` con Argon2id, comprobar el
  estado de cuenta y mantener la sesión según SCRUM-88. Estas tareas siguen
  perteneciendo al backend; no se han creado rutas ni módulos de servidor.
- El frontend controla 400, 401, 429 y errores de servidor/red. Para 401 siempre
  muestra «Credenciales incorrectas», sin revelar si existe el correo.
- El formulario bloquea envíos repetidos y elimina la contraseña tras cada intento.
  No guarda credenciales ni tokens en almacenamiento del navegador.

## Integración posterior

En `LoginForm.jsx`, tras `await login(...)`, hay un comentario con el punto
para conectar la navegación a la futura pantalla privada. Por ahora solo se
confirma el acceso y se muestra el correo devuelto por la API. No se inventa
una ruta de perfil ni un endpoint de consulta de sesión.

El usuario devuelto se conserva únicamente en memoria mientras esta pantalla
está montada. Recuperar la sesión tras recargar requiere un contrato adicional
del backend; no se deduce que el usuario haya cerrado sesión al recargar.
La autorización de recursos siempre debe comprobarse en el servidor.

## Verificación

`npm.cmd test`: pruebas de registro y de login con HTTP simulado, incluyendo
contrato, cookies, errores, validación, ojo de contraseña y navegación.
`npm.cmd run build`: compilación React. La integración real de autenticación
y cookies queda pendiente hasta que Ángel implemente la API.
