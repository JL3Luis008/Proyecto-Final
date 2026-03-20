# Spec: EPI-3 — Implementación de Wishlist

## Metadata
- **Tipo:** feature
- **Complejidad:** M
- **Fecha:** 2026-03-16
- **Estado:** DONE

## Historia
**Como** usuario,  
**Quiero** poder guardar mis productos favoritos en una lista de deseos,  
**Para** poder revisarlos más tarde y agregarlos al carrito sin tener que buscarlos de nuevo.

## Contexto
El código original tenía soporte completo en el backend para la *Wishlist* (base de datos, controladores, rutas RESTful atómicas), pero carecía completamente de interfaz en el frontend. La página `/wishlist` era un componente vacío y no había interacción en la tarjeta de producto.

## Diseño y Arquitectura (Global Context)
Dado que un producto puede aparecer múltiples veces en pantalla (en carruseles cruzados, búsquedas, listados de categoría), si cada `ProductCard` comprobara individualmente `inWishlist(id)` a la API, el frontend lanzaría N-requests, saturando la red.

**Decisión Arquitectónica:** 
Se implementó `WishlistContext.jsx` que **descarga la lista 1 sola vez por sesión** al montar (o al loguearse) y abstrae toda interacción optimista. La tarjeta envía la acción, el Context muta inmediatamente la UI (`wishlistItems` locales) e intenta persistirla en backend; si el backend falla, revierte la promesa (Optimistic UI Update).

## Criterios de Aceptación
- [x] CA-1: Creación del `wishlistService.js` mapeando `GET /api/wishList`, `POST /api/wishList/add`, `DELETE /api/wishList/remove/:id`, etc.
- [x] CA-2: Implementación de `WishlistContext.jsx` con estado global optimista y envoltorio en `App.jsx`.
- [x] CA-3: Página de UI `WishList.jsx` finalizada: muestra grilla de productos y maneja empty-state.
- [x] CA-4: Listado tiene botones funcionales de "Añadir al carrito" y "Eliminar".
- [x] CA-5: `ProductCard.jsx` intervenido con el ícono flotante `❤️/🤍` para toggling directo, interceptando clics anónimos para exigir login.

## Consideraciones de Seguridad
- El context intercepta usuarios no autenticados en cliente.
- El backend intercepta no autenticados con JWT verification.
- Enfoque defensivo en `addToSet` atómico de Mongoose previene inyecciones e inconsistencias si el usuario clickea 100 veces el corazón.

## Dependencias
- `ProductCard.jsx`, `WishList.jsx`, `App.jsx`
- Backend endpoints: `/api/wishList`

## Pendientes Abiertos y Gaps Detectados
- **Funcionalidades faltantes:** No se implementó un sistema de "Compartir Wishlist" (pública/privada), lo cual estaba fuera del alcance inicial pero es una mejora deseada.
- **Comportamientos inconsistentes:** Al eliminar un item desde la página de Wishlist, el contador en el Header se actualiza, pero si hay múltiples pestañas abiertas, la sincronización entre pestañas depende de un refresh manual (falta `BroadcastChannel` o similar).
- **Gaps Frontend/Backend:** El backend permite duplicados si se envían múltiples peticiones seguidas muy rápido (race condition), aunque el frontend lo previene visualmente.
- **Items para backlog:** Implementar sincronización entre pestañas (Storage Events) y añadir validación de duplicados estricta en el `save()` del modelo en backend.

## Resultados (se completa al cerrar)
- **Fecha de cierre:** 2026-03-16
- **CAs cumplidos:** 5/5
- **CAs no cumplidos:** 0
- **Deuda técnica generada:** El `WishlistContext` asume que el usuario nunca tendrá miles de items (carga todo en memoria). Si la lista crece mucho, requerirá paginación.
- **Lecciones aprendidas:** El uso de Optimistic UI mejoró drásticamente la percepción de velocidad en conexiones lentas.
- **Backlog derivado creado:** SI (en `task.md` -> F-406 sugerido).

## Matriz de cierre
| Item detectado | Estado | Acción |
|---|---|---|
| Wishlist Context | Confirmado | Cerrar |
| Toggling ❤️ | Confirmado | Cerrar |
| Vista WishList | Confirmado | Cerrar |
| Sincronización Pestañas | Parcial | Crear backlog |
| Compartir Lista | Fuera de alcance | Archivar |
