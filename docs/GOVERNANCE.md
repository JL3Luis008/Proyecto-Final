# Política de Gobernanza y Mantenimiento (Retro-Bits)

Este documento define las reglas de convivencia, mantenimiento y uso de IA en este repositorio.

## 1. Reglas de Mantenimiento Documental
- **Naming:** Archivos en `kebab-case`. Carpetas en `snake_case`.
- **Actualización:** Cada cambio en el código que afecte rutas, modelos o componentes clave DEBE actualizar su correspondiente archivo en `docs/knowledge/`.
- **Archivado:** Una vez que un Spec pasa a `DONE`, debe permanecer en `docs/specs/` durante el sprint actual y luego moverse a `docs/archive/`.
- **Eliminación:** No se eliminan archivos destructivamente; se mueven a `archive` con el prefijo `obsolete-`.

## 2. Reglas Cruciales para IA (Anti-Hallucination)
- **No inventar:** Prohibido referenciar archivos, rutas o librerías que no estén en el `INDEX.md` o en el repo físico.
- **Validación de Contrato:** Antes de proponer un cambio en el Frontend, valida el contrato en `docs/knowledge/api-architecture.md`.
- **Evidencia Obligatoria:** Ninguna IA puede cerrar una tarea sin adjuntar logs de tests exitosos o evidencia visual.

## 3. Protocolo de Vibe Coding
- Programar con "vibe" significa velocidad y creatividad apoyada por IA, pero con rigor técnico.
- Se permiten borradores rápidos, pero el código final debe pasar el `Code Reviewer`.
- El "Implementador" nunca aprueba su propia "Evidencia de QA".

## 4. Estándares por Categoría
- **Specs:** Deben incluir STRIDE y Criterios de Aceptación SMART.
- **ADRs:** Obligatorios para cualquier cambio que modifique la estructura de carpetas o introduzca una nueva librería global.
- **PRs:** Deben seguir el `pr-template.md`.
