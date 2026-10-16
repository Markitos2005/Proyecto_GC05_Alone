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
* **Comunicación:** Canales oficiales (Discord/Teams/WhatsApp) y horario de respuesta.
* **Toma de decisiones:** Por consenso en primera instancia; en desacuerdos, decisión fundamentada del rol responsable con registro en la Wiki.
* **Compromiso horario:** Cumplimiento de la dedicación acordada y aviso previo en caso de ausencia imprevista.
* **Gestión de tareas:** Uso de plataformas como Trello.