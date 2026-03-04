Sprint 1 - Progreso y Acciones

Resumen de acciones completadas:
- Se añadió un test unitario para NotificationController: file creado en
  ecommerce-api/src/controllers/__tests__/notificationController.test.js
- Alcance cubierto en Notification unit tests:
  - getNotifications (listado)
  - getNotificationById (404 y encontrado)
  - createNotification
  - updateNotification (found y not found)
  - deleteNotification (found y not found)

Observaciones de progreso:
- Existen planes para cubrir MW-12, MW-13 y MW-14 (rateLimiter) en Sprint 1; la estrategia se propone re-cargar módulos con NODE_ENV diferente para activar limitadores, sujeto a aprobación. Se documentará el enfoque en el TEST_PLAN.md durante la revisión.
- AU-19 (refreshToken) permanece como decisión: la implementación actual utiliza callbacks de jwt.verify; si se refactorara a async/await en una versión futura, se deben añadir pruebas de BD fallida para refreshToken.

Próximos pasos (Sprint 1):
- Añadir tests unitarios para middlewares pendientes (MW-12 a MW-14) si se decide habilitar rate-limiting en entorno de pruebas.
- Ampliar cobertura de unit tests para otros controladores críticos según la prioridad del negocio.
- Verificar integración Auth y Products para confirmar flujos de autenticación y paginación cubiertos.

Notas de gobernanza:
- Mantener este documento como registro de progreso y decisiones tomadas durante Sprint 1.
- Alinear con el TEST_PLAN.md para que los cambios y decisiones sean visibles en el plan maestro.
