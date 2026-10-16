# Lost&Found UEx — Misión del producto

## Idea del producto

Lost&Found UEx es una aplicación web para centralizar y ordenar la gestión de
objetos perdidos y encontrados en la Universidad de Extremadura.

El producto organiza dos necesidades relacionadas, pero distintas:

1. **Hallazgos de Conserjería:** objetos encontrados y depositados en una
   facultad, que el personal de Conserjería registra y gestiona.
2. **Avisos de pérdida:** comunicaciones publicadas por los usuarios cuando
   han perdido un objeto y no lo encuentran entre los hallazgos disponibles.

Cuando un usuario identifica un hallazgo que puede ser suyo, puede iniciar una
solicitud formal de recuperación. El Conserje de la facultad correspondiente
revisa la información aportada, valida o rechaza la solicitud y deja constancia
de la decisión.

## Problema que se quiere resolver

La información sobre objetos perdidos y encontrados puede circular de forma
fragmentada mediante comunicaciones informales, consultas presenciales o
canales independientes. Esta situación dificulta:

- saber dónde consultar los objetos encontrados;
- localizar un objeto mediante criterios como categoría, descripción,
  facultad o centro;
- solicitar la recuperación de un hallazgo de forma controlada;
- demostrar la posible pertenencia sin exponer información identificativa
  reservada;
- conocer el estado y el resultado de una solicitud;
- mantener un seguimiento fiable de las publicaciones, decisiones y
  devoluciones.

Lost&Found UEx aborda este problema sin sustituir la entrega física del
objeto: la aplicación registra la información y la decisión de recuperación,
pero la entrega se realiza según las instrucciones del Conserje y las normas
de la facultad.

## Usuarios y responsabilidades

El sistema diferencia exactamente tres roles:

| Rol | Necesidad y responsabilidad |
|---|---|
| **Usuario** | Buscar hallazgos, solicitar su recuperación, consultar sus solicitudes, publicar avisos de pérdida y gestionar sus propios avisos. |
| **Conserje** | Registrar y gestionar hallazgos de la facultad asignada, revisar solicitudes asociadas y validar o rechazar recuperaciones. |
| **Administrador** | Gestionar cuentas, roles, facultades, centros, categorías, asignaciones de Conserjes y auditoría del sistema. |

El acceso y las operaciones se limitan tanto por el rol como por el ámbito
correspondiente. En particular, un Conserje solo puede operar sobre la
facultad que tiene asignada, y un Usuario no puede publicar hallazgos ni
validar solicitudes.

## Propuesta de valor

Lost&Found UEx ofrece una experiencia única y trazable para:

- consultar en un punto central los hallazgos disponibles;
- buscar hallazgos de forma guiada según la pérdida descrita y su ubicación;
- mantener separado el canal informal de avisos de pérdida del flujo formal de
  recuperación;
- proteger los rasgos identificativos reservados de los objetos;
- solicitar una recuperación aportando información que permita demostrar la
  pertenencia;
- permitir que el Conserje correspondiente tome y comunique una decisión;
- conservar los estados e historial necesarios para saber qué ocurrió;
- proporcionar datos ficticios, documentación y pruebas que permitan revisar
  el producto sin depender del equipo de desarrollo.

Los avisos de pérdida no se convierten automáticamente en hallazgos, no
generan solicitudes de recuperación y no obligan a Conserjería a revisarlos.
Del mismo modo, el sistema no certifica jurídicamente la propiedad, no
gestiona por sí mismo la entrega física y no permite el contacto directo entre
usuarios como parte del flujo formal.

## Declaración de misión

La misión de Lost&Found UEx es hacer que la búsqueda y recuperación de objetos
perdidos en el entorno universitario sea clara, controlada y trazable,
conectando a los usuarios con los hallazgos gestionados por Conserjería,
ofreciendo un canal independiente para comunicar pérdidas y proporcionando a
cada rol únicamente las operaciones que necesita para actuar de forma segura
en su ámbito.

## Experiencia deseada

Lost&Found UEx debe ofrecer una experiencia:

- **Clara:** diferencia hallazgos, avisos y solicitudes, y explica las
  acciones disponibles y sus siguientes pasos.
- **Guiada:** ayuda al usuario a describir una pérdida, seleccionar su ámbito
  y encontrar hallazgos compatibles.
- **Controlada:** aplica los permisos del rol y la facultad antes de permitir
  cada operación.
- **Segura y respetuosa con la privacidad:** valida las entradas, limita la
  exposición de información y utiliza exclusivamente datos ficticios o
  sintéticos durante el desarrollo, las pruebas y la demostración.
- **Trazable:** registra estados, actores, fechas y motivos relevantes de las
  transiciones y decisiones.
- **Transparente:** informa del resultado de las acciones y del estado de las
  solicitudes, sin presentar una notificación como evidencia de que ha sido
  leída.
- **Recuperable:** comunica los errores de forma comprensible y ofrece una
  forma clara de continuar cuando sea posible.
- **Accesible e inclusiva:** permite utilizar los flujos principales a
  personas con diferentes capacidades.
- **Revisable:** puede instalarse, ejecutarse y evaluarse siguiendo la
  documentación, con datos de demostración representativos.
