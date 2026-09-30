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