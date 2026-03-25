Sprint 2 — Informe de progreso

Resumen ejecutivo
- Objetivo de Sprint 2: cubrir Core Business (Cart y Order) con pruebas unitarias, y establecer la base de pruebas de integración para Auth, con un enfoque en calidad de flujo y manejo de errores (BD y edge cases).
- Progreso hasta la fecha: se añadieron pruebas unitarias para NotificationController y ShippingAddressController; CT-13b (Category) cubre el caso de búsqueda sin resultados; se añadieron pruebas BD failure path en Cart (getCartByUser y updateCartItem).
- Se introdujo la batería de pruebas de rate limiting (MW-12..MW-14) en un test de middlewares para validar skip en entorno de test.
- El plan de Sprint 2 incluye la ejecución de pruebas unitarias en Cart y Order, y la estabilización de la integración de Auth, con target de cobertura ≥ 80% a nivel global.

Progreso de pruebas unitarias (actuales)
- NotificationController: completo (getNotifications, getNotificationById, createNotification, updateNotification, deleteNotification).
- ShippingAddressController: completo (createShippingAddress, getUserAddresses).
- CategoryController: CT-13b añadido (Sin resultados → 200 con categorías vacías y paginación coherente).
- CartController: BD failure paths cubiertos (CA-03b, CA-21) para getCartByUser y updateCartItem.
- RateLimiter: pruebas de skip en entorno de test para authLimiter, apiLimiter y strictLimiter creadas (rateLimiter.test.js).

Bloques pendientes y riesgos
- Cart y Order: faltan pruebas de flujo completo y casos límite de validación en distintas rutas (p. ej., addProductToCart, clearCartItems, deleteCart). Se planifica cubrirlos en Sprint 2.Si hay cambios en la prioridad de módulos, actualizaremos.
- Integración: Auth base en marcha; faltan tests de endpoints específicos (register/login/refresh/check-email) con datos persistidos en memoria.
- Cobertura global: objetivo 80% al menos; se pueden necesitar ajustes en el plan si encontramos cuellos de botella en las pruebas.

Decisiones a confirmar (impacto en Sprint 2/3)
- Mutación testing: ¿activamos Stryker/Mutant? Propuesta: inicio con 60-70% y revisiones mensuales.
- Contract testing: Pact vs OpenAPI; dominio inicial y cadencia de ejecución en CI.
- Estrategia de rate limiting en pruebas: ¿activamos pruebas reales (Opción A) o simulamos (Opción B)?
- Frecuencia de ejecuciones en CI: cada push, PR, o nightly builds.

Plan de ejecución para próximos días

Anexos
- Archivos añadidos en este sprint
  - ecommerce-api/src/middlewares/__tests__/rateLimiter.test.js
  - ecommerce-api/SPRINT2-RELEASE.md
  - ecommerce-api/SPRINT2-REPORT.md (este documento)
  - ecommerce-api/TEST_PLAN_SPRINT2_PROGRESS.md
  - ecommerce-api/TEST_PLAN.md (actualización para Sprint 2)
- En progreso: desarrollo de Sprint 2 Report detallado para distribución entre el equipo.

Notas adicionales (post-actualización):
- Se añadieron pruebas BD para Cart (deleteCart BD) y BD paths para Category (update/delete) y ShippingAddress (getUserAddresses) para ampliar cobertura de fallos.
- Se incorporó plan de rate limiting con prueba de skip en test env (MW-12..MW-14).
- Se actualizará el SPRINT2-REPORT.md con resultados de ejecución y cobertura una vez se corran las pruebas en CI y local.
