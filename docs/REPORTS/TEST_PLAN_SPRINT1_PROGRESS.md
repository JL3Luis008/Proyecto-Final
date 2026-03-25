Sprint 1 - Progreso y Decisiones (documento vivo)
- Progreso: Parcial; se añadieron dos tests unitarios críticos: notificationController y shippingAddressController.
- Decisiones a confirmar:
  1) Mutación: ¿activar Stryker y cuál umbral inicial? (propuesta: 60-70%)
  2) Contract testing: Pact vs OpenAPI; dominios prioritarios y ritmo.
  3) Rate limiting en tests: estrategia para simular MW-12 a MW-14 sin afectar la estabilidad de CI.
- Progreso adicional: CT-13b (CategoryController) agregado como test de unidad de integración para searchCategory sin resultados. Esto refuerza la cobertura de casos límite y valida la estructura de respuesta en escenarios sin resultados.
- Siguientes pasos (Sprint 2): ampliar unitarios a Cart, Order, Category, Review, WishList, PaymentMethods; añadir pruebas de integración para Notification y nuevas rutas; asegurar cobertura global ≥ 80% y preparar pipelines de CI.
