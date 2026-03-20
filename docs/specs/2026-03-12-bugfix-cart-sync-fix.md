# Spec: Cart Synchronization Fix

## Metadata
- **Tipo:** bugfix
- **Complejidad:** S
- **Fecha:** 2026-03-12
- **Estado:** DONE

## Historia
**Como** usuario autenticado,
**Quiero** que mi carrito de compras se sincronice automáticamente con el servidor,
**Para** que mis productos seleccionados estén disponibles en cualquier dispositivo al iniciar sesión.

## Contexto
El usuario recientemente añadió lógica de sincronización en `CartContext.jsx` que referencia un `cartService.js` inexistente y un tipo de acción `INIT` no manejado en el reducer. Esto causaba errores de ejecución y falta de persistencia real en el backend.

## Criterios de Aceptación
- [x] CA-1: Crear `cartService.js` con métodos para GET, POST, PUT y DELETE vinculados a la API.
- [x] CA-2: Definir y manejar `CART_INIT` en `cartReducer.js` para cargar el estado inicial desde el servidor.
- [x] CA-3: Verificar que `addToCart`, `updateQuantity` y `removeFromCart` llamen al backend exitosamente.
- [x] CA-4: Asegurar que el `userId` utilizado provenga del contexto de autenticación verificado.

## Consideraciones de Seguridad
- **Amenazas STRIDE identificadas:** Tampering (manipulación de userId), Information Disclosure (mensajes de error reveladores).
- **Controles de mitigación:** 
    - El backend valida el token JWT (Zero Trust).
    - El frontend captura errores de red sin exponer detalles técnicos al usuario final (Fail Securely).
    - Se añadió `.gitignore` para prevenir exposición de secrets (Security by Design).
- **Inputs que requieren validación:** `productId`, `quantity` (deben ser numéricos y positivos).
- **Secrets involucrados:** Ninguno (se usa el token existente en `localStorage`).
- **Superficie de ataque afectada:** Endpoints de `/api/cart`.

## Dependencias
- Internas: `AuthContext`, `http.js` (axios instance).
- Externas: Axios.

## Decisiones de Diseño
Se optó por centralizar la transformación de datos del API en el `cartReducer` para asegurar integridad. Se implementó un `.gitignore` robusto para cumplir con el SSDLC.

## Riesgos y Deuda Técnica
- Ninguno crítico identificado en esta fase.

## Resultados
- Fecha de cierre: 2026-03-12
- CAs cumplidos: Todos (1-4)
- CAs no cumplidos: Ninguno
- Deuda técnica generada: Ninguna
- Lecciones aprendidas: Importancia de sincronizar estructuras de datos entre API y Reducers.
