# Initial Planning Review v01

## 1) Metadatos de ejecución

- **Proyecto:** Lost&Found UEx (repositorio `UniExtremadura/Proyecto_GC05`)
- **Modo:** READINESS
- **Baseline/scope revisado:** Objetivos y alcance de producto + EP-001..EP-005 + DoR/DoD
- **Fuentes revisadas:**
  - `specs/product/mission.md`
  - `specs/product/goals.md`
  - `specs/EP-001/spec.md`
  - `specs/EP-002/spec.md`
  - `specs/EP-003/spec.md`
  - `specs/EP-004/spec.md`
  - `specs/EP-005/spec.md`
  - `docs/quality/definition-of-ready.md` (v0.2, 2026-10-07)
  - `docs/quality/definition-of-done.md` (v0.2, 2026-10-07)
- **Horizonte declarado:** 6 iteraciones (1 semana por sprint)
- **Fecha de revisión:** 2026-10-16
- **Versión de informe:** v01
- **Informe previo (RECHECK):** N/A
- **Workbook/extract:** N/A (no se encontró fuente tipo Excel en la ruta esperada)
- **Commit de referencia:** N/A

## 2) Resumen

- **Resultado de readiness:** **NOT_READY**
- **Número de hallazgos bloqueantes:** **3**
- **Conclusión principal:** Existe material suficiente para revisar alcance y estimaciones, pero hay inconsistencias bloqueantes de trazabilidad y una base de capacidad no demostrada (40 h-p/semana sin desglose de disponibilidad/deducciones), lo que impide sostener una hipótesis de planificación fiable para el scope nombrado.

## 3) Inventario de evidencia y matriz de compatibilidad

| Dimensión | Estado | Evidencia | Límite |
|---|---|---|---|
| Scope y prioridades | Parcialmente compatible | Scope S-01..S-07, prioridades Must/Should/Could por épica e historia | Inconsistencias de mapeo objetivo↔épica y trazabilidad en EP-002 |
| Madurez de requisitos / DoR | Compatible con límites | Historias con actor, valor, AC y restricciones; DoR explícita | No todas las dependencias parecen semánticamente justificadas |
| Cobertura de estimaciones y unidades | Compatible con límites | Estimaciones en h-p por épica e historia; carga por iteración | Diferencia 187 h-p (épicas) vs 178 h-p (historias) sin desglose detallado por épica |
| Capacidad efectiva | No compatible (bloqueante) | Declaración de 40 h-p/iteración | Sin disponibilidad por persona, deducciones ni capacidad por skill/rol |
| Horizonte y duración | Compatible | 6 iteraciones, sprint semanal | Sin calendario fechado ni hitos externos declarados |
| Dependencias y capacidades | Parcialmente compatible | Predecesoras de épicas e historias declaradas | Hay precedencias dudosas/no justificadas (ej. US-010 ← US-006) |
| Supuestos e incertidumbre | Compatible | Supuestos A-01..A-07; incertidumbre por épica e historia | Falta trigger/owner formal para validar supuestos críticos |
| Coste | No evaluable (N/A) | No hay presupuesto ni tarifa/hora declarados | No procede cálculo económico con evidencia actual |
| Viabilidad de planificación | No compatible (bloqueante) | Existe distribución por iteración | Bloqueada por capacidad no sustentada y trazabilidad inconsistente |

## 4) Hallazgos

### IPR-v01-001
- **Categoría:** Capacidad
- **Severidad:** CRITICAL
- **Bloqueante:** YES
- **Fuente/ID:** `specs/product/goals.md` (sección de plan de iteraciones)
- **Evidencia observada:** Se declara “capacidad efectiva disponible = 40 h-p por semana”, pero no aparece el desglose de disponibilidad por persona, ausencias previstas, deducciones (ceremonias, coordinación, soporte) ni restricciones por perfil.
- **Impacto:** No se puede verificar si la capacidad usada para el plan es consistente ni reproducible; la factibilidad temporal queda sin soporte.
- **Acción recomendada:** Añadir base de cálculo explícita de capacidad (personas, horas/semana por persona, deducciones, capacidad neta total y por skill crítico).
- **Decisión/pregunta requerida:** Confirmar si 40 h-p es capacidad neta validada del equipo o un valor objetivo provisional.
- **Owner propuesto (rol):** Product Owner + Team Lead

### IPR-v01-002
- **Categoría:** Trazabilidad de alcance
- **Severidad:** CRITICAL
- **Bloqueante:** YES
- **Fuente/ID:** `specs/EP-002/spec.md` (tabla “Trazabilidad de la épica”)
- **Evidencia observada:** La tabla de historias de EP-002 lista `US-006, US-007, US-008 y US-009`, mientras el contenido de la épica define `US-009, US-010, US-011 y US-012`; `US-008` no está definido en la épica.
- **Impacto:** Ruptura de la cadena objetivo→épica→historias→estimación; invalida agregaciones de cobertura y dificulta verificar precedencias reales.
- **Acción recomendada:** Corregir la tabla de trazabilidad de EP-002 para que refleje exactamente las historias incluidas y su relación con objetivos/indicadores.
- **Decisión/pregunta requerida:** Confirmar si US-012 debe permanecer en EP-002 o migrar definitivamente a EP-004.
- **Owner propuesto (rol):** Product Owner + Analista funcional

### IPR-v01-003
- **Categoría:** Consistencia objetivo↔épica
- **Severidad:** MAJOR
- **Bloqueante:** YES
- **Fuente/ID:** `specs/EP-001/spec.md` (cabecera y trazabilidad) vs `specs/product/goals.md` (G-04, G-05)
- **Evidencia observada:** EP-001 referencia “Objetivo G-04 / acceso controlado”, pero en objetivos de producto G-04 es “Avisos de pérdidas” y el control de acceso/roles corresponde a G-05.
- **Impacto:** Ambigüedad de alcance y validación; riesgo de priorización errónea y de cobertura incompleta de objetivos.
- **Acción recomendada:** Alinear identificadores y descripciones de objetivo en EP-001 con el catálogo de objetivos del producto.
- **Decisión/pregunta requerida:** Confirmar si EP-001 debe trazar a G-05 exclusivamente o también a otro objetivo secundario.
- **Owner propuesto (rol):** Product Owner

### IPR-v01-004
- **Categoría:** Dependencias
- **Severidad:** MAJOR
- **Bloqueante:** NO
- **Fuente/ID:** `specs/EP-002/spec.md` (US-010 predecesora US-006)
- **Evidencia observada:** US-010 (búsqueda de hallazgos) depende de US-006 (cambio de contraseña), sin relación funcional directa explícita.
- **Impacto:** Puede introducir restricciones artificiales y desplazar historias en iteraciones sin necesidad técnica.
- **Acción recomendada:** Revisar y justificar precedencias historia a historia; eliminar dependencias no causales.
- **Decisión/pregunta requerida:** ¿US-010 depende realmente de autenticación básica (US-002/US-003) y no de gestión de contraseña?
- **Owner propuesto (rol):** Team Lead + Analista funcional

### IPR-v01-005
- **Categoría:** Estimaciones
- **Severidad:** MINOR
- **Bloqueante:** NO
- **Fuente/ID:** `specs/product/goals.md` (carga iteraciones y nota de diferencias)
- **Evidencia observada:** Suma de historias planificadas = 178 h-p; suma de épicas = 187 h-p (delta = 9 h-p) con mención genérica a trabajo transversal.
- **Impacto:** La diferencia está declarada pero sin descomposición trazable por paquete; reduce auditabilidad fina.
- **Acción recomendada:** Documentar explícitamente qué ítems transversales componen el delta y a qué iteración/épica se imputan.
- **Decisión/pregunta requerida:** Validar si el delta incluye integración/QA/documentación de IT-06 o deuda técnica concreta.
- **Owner propuesto (rol):** Team Lead

### IPR-v01-006
- **Categoría:** Viabilidad de recursos por perfil
- **Severidad:** MAJOR
- **Bloqueante:** NO
- **Fuente/ID:** Conjunto de especificaciones
- **Evidencia observada:** Hay capacidad agregada de equipo, pero no evidencia de límites por perfil (backend, frontend, QA, seguridad, etc.).
- **Impacto:** La viabilidad por semana puede aparentar holgura global y aun así fallar por cuello de botella individual/especialidad.
- **Acción recomendada:** Añadir matriz de capacidad por perfil crítico para validar factibilidad de cada iteración.
- **Decisión/pregunta requerida:** Confirmar perfiles disponibles y dedicación neta semanal por perfil.
- **Owner propuesto (rol):** Team Lead

## 5) Observaciones aritméticas y de capacidad/recursos

- **Unidades identificadas:** persona-hora (h-p) para estimaciones y capacidad.
- **Fórmulas usadas (soportadas):**
  - Carga total planificada por iteración = 25 + 35 + 31 + 35 + 34 + 18 = **178 h-p**.
  - Capacidad total del horizonte (si 40 h-p/iteración se acepta) = 40 × 6 = **240 h-p**.
  - Holgura agregada teórica = 240 − 178 = **62 h-p**.
  - Estimación agregada de épicas = 60 + 41 + 24 + 31 + 31 = **187 h-p**.
  - Diferencia épicas vs historias = 187 − 178 = **9 h-p**.
- **Inclusiones:** Solo cifras explícitas del material revisado.
- **Exclusiones:** Costes monetarios, calendario con fechas, productividad histórica, factor foco no declarado.
- **Desconocidos críticos:** disponibilidad por persona, deducciones formales, capacidad por skill.
- **Límite de chequeo agregado:** el margen global no demuestra factibilidad semanal por especialidad ni por dependencias.

## 6) Observaciones de dependencias y capacidades

- **Pre-requisitos tipados observados:**
  - Épicas: EP-002 depende de EP-001; EP-004 depende de EP-001 y EP-002; EP-005 depende de EP-001..EP-004.
  - Historias: precedencias explícitas por US en cada spec.
- **Ciclos:** No se observaron ciclos explícitos en los IDs revisados.
- **Entradas externas no resueltas:** Integración OAuth (Could) con incertidumbre alta y dependencia de proveedor externo; no bloquea baseline funcional local.
- **Cuellos de botella soportados:** probables en validación de recuperación y administración por rol, pero no cuantificables por falta de capacidad por perfil.
- **Límite:** Sin asignación temporal/persona, la factibilidad recurso-tiempo detallada queda pendiente del plan humano.

## 7) Resultado de coste

- **Resultado:** N/A
- **Justificación:** No hay presupuesto, tarifa, coste/hora ni límite económico explícito en las fuentes revisadas.

## 8) Preguntas y siguientes acciones sugeridas

| Acción/Pregunta | Owner propuesto (rol) | Trigger de validación | Bloqueante |
|---|---|---|---|
| Confirmar y documentar la fórmula de capacidad neta de 40 h-p/semana (personas + deducciones) | Product Owner + Team Lead | Actualización de documento base de planificación | Sí |
| Corregir trazabilidad de EP-002 (historias reales y objetivos) | Product Owner + Analista funcional | Nueva versión de `specs/EP-002/spec.md` | Sí |
| Alinear mapeo de EP-001 con catálogo de objetivos (G-05 vs G-04) | Product Owner | Nueva versión de `specs/EP-001/spec.md` | Sí |
| Revisar dependencias dudosas (ej. US-010 ← US-006) y justificar/limpiar precedencias | Team Lead | Revisión de precedencias por historia | No |
| Desglosar 9 h-p transversales entre épicas e iteraciones | Team Lead | Anexo de estimación o actualización de `goals.md` | No |
| Añadir capacidad por perfil para detectar cuellos de botella semanales | Team Lead | Matriz de capacidades por rol técnico | No |

## 9) Matriz de disposición RECHECK

No aplica en esta ejecución (no existe informe previo en la serie para contrastar decisiones humanas y cambios de evidencia).

## 10) Consejo final y declaración de límites

Con la evidencia actual, la preparación para construir una hipótesis de planificación del scope nombrado es **NOT_READY** por tres bloqueos explícitos: base de capacidad no sustentada, inconsistencia de trazabilidad en EP-002 e inconsistencia objetivo↔épica en EP-001.  
Esta revisión **no** aprueba compromiso, cronograma, baseline ni gate de calidad; únicamente evalúa readiness del insumo de planificación.  
Fuentes funcionales y de calidad permanecen sin cambios. En esta ejecución se ha creado **solo** este nuevo informe en la ruta permitida.
