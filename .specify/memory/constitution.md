# Constitución del Proyecto

## 1. Core Principles

### 1. Especificación y trazabilidad
Toda funcionalidad debe estar especificada antes de implementarse.
Debe poder seguirse la relación:
Necesidad → requisito → plan → tareas → código → pruebas
No se implementarán funcionalidades que no estén justificadas por una especificación aprobada.

### 2. Disciplina de alcance del MVP
El equipo debe centrarse en las funcionalidades necesarias para obtener un producto mínimo viable.
Las ampliaciones de alcance deberán:
* Estar justificadas.
* Ser priorizadas.
* Evaluar su impacto en plazo, coste y capacidad.
* Quedar documentadas como decisiones humanas.

### 3. Calidad y comportamiento verificable
Los requisitos deben ser claros, medibles y comprobables.
Cada funcionalidad debe incluir:
* Criterios de aceptación.
* Tratamiento de errores.
* Pruebas adecuadas.
* Cumplimiento de la definición de terminado (Definition of Done).
Una funcionalidad no se considera terminada únicamente porque el código funcione en condiciones ideales.

### 4. Seguridad, privacidad y datos sintéticos
El proyecto utilizará exclusivamente datos ficticios o sintéticos.
La solución deberá:
* Evitar el uso de datos personales reales.
* Validar las entradas.
* Proteger la información y las operaciones.
* Considerar la seguridad desde la especificación hasta las pruebas.

### 5. Usabilidad y accesibilidad
Las funcionalidades deben ser comprensibles, consistentes y fáciles de utilizar.
Los flujos principales, los mensajes de error y las interfaces deberán diseñarse teniendo en cuenta la accesibilidad y la diversidad de usuarios.

---

## 2. Development and Documentation Standards

### Reglas de documentación
Cada artefacto tiene una responsabilidad diferente:
* **spec.md**: explica qué se necesita y por qué.
* **plan.md**: explica cómo se abordará técnicamente.
* **tasks.md**: descompone el plan en trabajo concreto y ejecutable.

Las decisiones importantes deberán quedar documentadas y los artefactos deberán mantener la trazabilidad entre ellos.

---

## 3. Quality Gates and Delivery Workflow

### Controles de calidad
Antes de aprobar una especificación, un plan o una implementación, debe comprobarse que:
* Cumple los principios de esta constitución.
* Respeta el alcance acordado.
* Mantiene la trazabilidad.
* Define criterios verificables.
* Considera calidad, pruebas, seguridad y accesibilidad.
* No contiene decisiones importantes sin justificar.

---

## 4. Governance

### Gobierno
La constitución tiene prioridad sobre el resto de los documentos del proyecto.
Cualquier modificación deberá:
* Estar justificada.
* Ser aprobada explícitamente.
* Registrar la fecha y la nueva versión.
* Indicar qué documentos o decisiones resultan afectados.

Las excepciones deberán ser explícitas, justificadas, aprobadas y, cuando sea posible, temporales.

---

## 5. Team Charter y Organización

### 5.1. Definición de la Empresa de Desarrollo
* **Nombre de la empresa:** Grupo GC05
* **Propósito:** Diseñar y construir soluciones de software robustas, seguras y centradas en el usuario, aplicando rigurosidad en la ingeniería de requisitos, trazabilidad continua y buenas prácticas ágiles para entregar productos viables, fiables y de alto impacto operativo.
* **Servicios:** Desarrollo de Software
* **Contexto:** Grupo de estudiantes de la Universidad de Extremadura. El proyecto estará condicionado por la necesidad de compatibilizar su desarrollo con otras actividades académicas. 

### 5.2. Miembros y Responsabilidades
| Integrante | Rol Principal | Responsabilidades | Capacidad Efectiva (h/semana) |
| :--- | :--- | :--- | :--- |
| Luis Caballero | Product Owner | visión y valor, mantener y priorizar el Product
Backlog, escribir historias con criterios de aceptación, gestionar 
stakeholders, aceptar/rechazar incrementos, alinear roadmap y objetivos.  | 5 |
| Samuel Gomes | Scrum Master | facilitar ceremonias, proteger el proceso y el 
timeboxing, fomentar comunicación y feedback, mejorar el flujo (WIP, 
cycle time), impulsar retrospectivas y acuerdos de trabajo. | 10 |
| Ángel Parra | Tech Lead | arquitectura y estándares, decisiones técnicas 
(ADRs), descomposición en tareas, revisión de PRs, control de deuda 
técnica, mentoring y gestión de riesgos. | 10 |
| Raúl Rosado | DevOps/QA | CI/CD, estrategia de pruebas (unitarias, 
integración, e2e), gestión de entornos, release management, 
observabilidad básica, runbooks y despliegues. | 10 |
| Marcos Escribano | Developer | Diseño e implementación de código, desarrollo de pruebas unitarias y de integración, refactorización, estimación técnica de tareas, documentación de componentes y cumplimiento de la Definition of Done (DoD). | 5 |

### 5.3. Acuerdos de Trabajo del Equipo (Working Agreements)
* **Comunicación:** Los canales oficiales serán WhatsApp para comunicaciones operativas y Discord para reuniones puntuales, coordinación técnica y seguimiento de incidencias. Las decisiones que afecten al alcance, la arquitectura, la seguridad o la planificación no se considerarán válidas hasta quedar registradas en el repositorio o en la Wiki.
* **Disponibilidad y respuesta:** Cada integrante comunicará sus periodos habituales de disponibilidad. Los mensajes relacionados con una tarea activa deberán responderse en un plazo razonable, preferiblemente dentro de las 24 horas siguientes. Si una persona no puede responder o trabajar durante más de un día, deberá avisar al equipo y actualizar las tareas afectadas.
* **Reuniones:** Las reuniones se convocarán con un objetivo y un orden del día claros. Se respetará el timeboxing acordado y se cerrarán con una relación breve de decisiones, responsables y siguientes pasos. La asistencia podrá ser sustituida por una actualización escrita cuando existan incompatibilidades académicas justificadas.
* **Toma de decisiones:** Se buscará el consenso mediante argumentos basados en los objetivos del producto, las especificaciones y la constitución. Si no se alcanza consenso, decidirá el rol responsable del ámbito afectado: el Product Owner para valor y alcance, el Tech Lead para arquitectura y decisiones técnicas, el Scrum Master para el proceso y el flujo de trabajo, y DevOps/QA para la estrategia de pruebas y la preparación de entornos. La decisión deberá registrar contexto, alternativas consideradas, decisión, responsable y fecha.
* **Gestión de cambios:** Ningún cambio de alcance, prioridad, estimación, dependencia, rol, estado o restricción se incorporará de forma informal. Deberá justificarse, analizar su impacto en plazo, capacidad y trazabilidad, recibir la aprobación correspondiente y actualizar los documentos afectados.
* **Compromiso horario:** Cada integrante respetará la capacidad efectiva declarada en el Team Charter y avisará con antelación de ausencias previsibles o, tan pronto como sea posible, de ausencias imprevistas. Las tareas no se reasignarán silenciosamente: cualquier cambio de responsable o de capacidad se registrará en la herramienta de seguimiento.
* **Gestión de tareas:** Trello será la herramienta de referencia para planificar y seguir el trabajo. Cada tarea deberá tener una descripción suficiente, responsable, prioridad, estimación, relación con una historia o requisito y estado actualizado. No se iniciará una tarea que dependa de información o trabajo pendiente sin dejar constancia de esa dependencia.
* **Flujo de trabajo:** Las tareas seguirán, como mínimo, los estados `Backlog`, `Ready`, `In progress`, `In review`, `Blocked` y `Done`. Una tarea solo pasará a `Done` cuando cumpla los criterios de aceptación aplicables, las comprobaciones de calidad y la Definition of Done. Las tareas bloqueadas deberán indicar la causa, el responsable de desbloqueo y la siguiente acción.
* **Revisión de código:** Todo cambio de código deberá revisarse mediante Pull Request antes de integrarse en la rama acordada. La revisión comprobará la corrección funcional, la seguridad, la legibilidad, las pruebas, la trazabilidad y el cumplimiento de las convenciones del proyecto. La persona autora no aprobará en solitario sus propios cambios.
* **Pruebas y calidad:** Las pruebas relevantes se definirán junto con la tarea y se ejecutarán antes del cierre. Los fallos críticos, las regresiones y las vulnerabilidades conocidas impedirán marcar el trabajo como `Done` hasta que se resuelvan o exista una decisión explícita y documentada de aceptación del riesgo.
* **Integración y ramas:** Los cambios se desarrollarán en ramas de trabajo y se integrarán mediante Pull Request. Las ramas deberán mantenerse actualizadas con la rama objetivo y no se introducirán cambios directamente en la rama principal salvo una excepción acordada y registrada.
* **Documentación y trazabilidad:** Las historias, decisiones, tareas, cambios de arquitectura, pruebas y evidencias deberán mantener la relación necesidad → requisito → plan → tareas → código → pruebas. La documentación afectada se actualizará como parte del mismo trabajo, no como una actividad opcional posterior.
* **Bloqueos y riesgos:** Cualquier bloqueo que pueda afectar a una iteración, una dependencia o un criterio de aceptación se comunicará en cuanto se detecte. El equipo registrará su impacto, responsable, fecha de revisión y estrategia de mitigación o escalado.
* **Conflictos y revisión de acuerdos:** Los desacuerdos se tratarán primero con las personas implicadas y con argumentos técnicos o de producto. Si persisten, se escalarán al rol responsable del ámbito correspondiente. Los acuerdos de trabajo se revisarán en las retrospectivas o cuando cambien la composición, la capacidad o las necesidades del proyecto.