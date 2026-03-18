# Spec: EPI-2 — Checkout API Migration

## Metadata
- **Tipo:** feature / refactor
- **Complejidad:** M
- **Fecha:** 2026-03-16
- **Estado:** DONE

## Historia
**Como** sistema en producción,  
**Quiero** que el Checkout guarde y lea datos desde la API real (direcciones, métodos de pago y órdenes),  
**Para** que la información del usuario persista de forma segura en la base de datos y no se pierda al cambiar de dispositivo (eliminando la dependencia de `localStorage`).

## Contexto
El flujo de Checkout estaba implementado como un frontend "mock" que guardaba y leía todo exclusivamente de `localStorage` (`shippingAddresses`, `paymentMethods`, `orders`). No se estaba comunicando con el backend, lo cual impedía el flujo real de e-commerce.

En esta fase se implementaron los servicios reales y se reescribió el componente `Checkout.jsx` para consumirlos.

## Criterios de Aceptación
- [x] CA-1: `shippingAddressService.js` implementado con todos los verbos HTTP.
- [x] CA-2: `paymentMethodService.js` implementado con todos los verbos HTTP.
- [x] CA-3: Corrección de bug de sintaxis (curried function) en `orderService.js` (`createOrder`).
- [x] CA-4: Adaptación de `normalizeAddress` para mapear el campo `address` (API) a `address1` (UI).
- [x] CA-5: `Checkout.jsx` ya no usa `readLocalJSON` ni `writeLocalJSON`. Toda carga y guardado es mediante llamadas `await` a los servicios de API.
- [x] CA-6: El botón "Confirmar y Pagar" crea la orden real en el backend en lugar de pushear a `localStorage.getItem("orders")`.

## Consideraciones de Seguridad
- **Amenazas STRIDE:** Tampering — antes el usuario podía alterar libremente los precios y montos totales modificando el objeto guardado en `localStorage`. Ahora la orden se envía al backend. (Nota: el backend debe validar precios contra la BD, no confiar ciegamente en el payload).
- **Secrets involucrados:** Ninguno.

## Dependencias
- Internas: `Checkout.jsx`, `shippingAddressService.js`, `paymentMethodService.js`, `orderService.js`, `storageHelpers.js`
- Externas: endpoints de backend `/api/shipping-address`, `/api/payment-methods`, `/api/orders`

## Decisiones de Diseño
- **Limpieza vs Soporte Legacy:** Se decidió *no* realizar una migración de datos desde `localStorage` a la BD para los usuarios actuales. Los datos previos en `localStorage` simplemente son ignorados. Para un proyecto en fase de desarrollo, esto es un trade-off aceptable para no engordar el código con scripts de migración desechables.
- El estado `loadingLocal` se reutilizó (a pesar del nombre) para denotar peticiones de red (API).

## Resultados
- Fecha de cierre: 2026-03-16
- CAs cumplidos: Todos.
- Deuda técnica eliminada: Checkout desconectado + bug en orderService + falsos consumos de JSON local.
