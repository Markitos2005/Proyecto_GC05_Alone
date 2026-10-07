# Definition of Done (DoD)

Versión: 0.2
Fecha: 2026-10-07

## Propósito
Este documento define las condiciones mínimas que debe cumplir una historia de usuario o requisito para considerarse terminado. La intención es asegurar que el trabajo entregado está implementado, verificado y listo para ser revisado o integrado sin dejar incertidumbres críticas.

## Regla general
Una User Story se considera terminada una vez cumplidos todos los criterios enunciados a continuación 

## Criterios de terminación

### 1. Implementación
- [ ] La funcionalidad descrita por la historia ha sido implementada.
- [ ] La implementación sigue la arquitectura y convenciones técnicas acordadas para el proyecto.
- [ ] No queda ninguna incidencia crítica de implementación sin resolver.

### 2. Criterios de aceptación
- [ ] Se han verificado todos los Acceptance Criteria asociados a la historia.
- [ ] Existe evidencia de la verificación cuando se requiere.
- [ ] El comportamiento implementado coincide con la historia aprobada.

### 3. Testing
- [ ] Se han ejecutado las pruebas relevantes, ya sean automáticas o manuales.
- [ ] Las pruebas cubren el comportamiento esperado y las condiciones de error relevantes.
- [ ] Las pruebas relevantes existentes siguen pasando correctamente.

### 4. Integración
- [ ] La implementación ha sido integrada en la rama o flujo de trabajo acordado.
- [ ] La versión integrada compila, ejecuta o funciona correctamente según el contexto.
- [ ] El cambio no introduce regresiones críticas conocidas.

### 5. Requisitos NO Funcionales
- [ ] Se han revisado los requisitos no funcionales aplicables.
- [ ] Se han considerado, cuando corresponda, restricciones de seguridad, usabilidad, accesibilidad y rendimiento.
- [ ] La solución cumple los requisitos de calidad y cumplimiento aplicables al caso.

### 6. Documentación y trazabilidad
- [ ] Se ha actualizado la documentación técnica o de usuario que resulta necesaria.
- [ ] La historia puede relacionarse con su implementación y su evidencia de verificación.
- [ ] Se han documentado decisiones relevantes o desviaciones que se hayan producido.

### 7. Review
- [ ] El trabajo ha sido revisado conforme al proceso acordado por el equipo.
- [ ] No queda ningún problema bloqueante sin resolver.

## Política de cierre
Una historia no se considera terminada por el mero hecho de que el código “parezca funcionar”. Debe quedar demostrada la corrección funcional, la calidad del resultado y su preparación para la entrega o integración.

## Resultado esperado
Cuando se cumplen estos criterios, la historia puede cerrarse como Done con una confianza razonable de que el entregable está terminado, validado y listo para su uso o revisión posterior.
