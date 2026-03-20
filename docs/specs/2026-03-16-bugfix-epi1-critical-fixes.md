# Spec: EPI-1 — Correcciones Críticas y de Higiene

## Metadata
- **Tipo:** bugfix + refactor
- **Complejidad:** S
- **Fecha:** 2026-03-16
- **Estado:** DONE

## Historia
**Como** sistema en producción,  
**Quiero** que todos los controladores usen `next(error)` y que el código no tenga console.logs de debug ni imports desordenados,  
**Para** que los errores sean manejados de forma segura y centralizada, sin exponer internos al cliente.

## Contexto
Auditoría del 2026-03-16 detectó 4 issues directamente accionables en EPI-1. Todos de baja complejidad pero con impacto en producción:
1. `getProductByCategory` lanzaba el objeto de error Mongoose crudo al cliente.
2. `Setttings.jsx` tenía un typo en el nombre de archivo que fallaría en Linux/Mac (case-sensitive).
3. `mongoose` era importado al final de `server.js` violando orden semántico.
4. Cinco `console.log` de debug activos en `productController.js` en producción.

## Criterios de Aceptación
- [x] CA-1: `getProductByCategory` usa `next(error)` — errores de BD pasan al errorHandler global
- [x] CA-2: El archivo se llama `Settings.jsx` (sin triple t) y el import en `App.jsx` es correcto
- [x] CA-3: `import mongoose` es la tercera línea de `server.js` (con los demás imports)
- [x] CA-4: Sin `console.log` de debug en `productController.js`

## Consideraciones de Seguridad
- **Amenazas STRIDE:** Information Disclosure — el error crudo de Mongoose exponía schema details al cliente.
- **Control aplicado:** Ahora pasa por `errorHandler.js` que filtra información interna en producción.
- **Secrets involucrados:** Ninguno.

## Dependencias
- Internas: `errorHandler.js`, `App.jsx`, `productController.js`, `server.js`
- Externas: Ninguna

## Decisiones de Diseño
- No se reestructuró nada más allá de lo necesario. Cambios mínimos para estabilizar sin riesgo de regresión.

## Resultados
- Fecha de cierre: 2026-03-16
- CAs cumplidos: 1, 2, 3, 4
- CAs no cumplidos: Ninguno
- Deuda técnica generada: Ninguna
- Lecciones aprendidas: El typo en filename es un bug silencioso en Windows pero crítico en deploy Linux.
