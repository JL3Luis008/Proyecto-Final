# Plan de Pruebas E2E - Registro y Login (Retro-Bits)

Este archivo documenta el plan específico y el progreso de la implementación de pruebas End-to-End utilizando Cypress para los flujos críticos de autenticación.

## 📋 Escenarios de Prueba

### 1. Registro de Usuario
- [ ] **Flujo Exitoso**: Completar el formulario con datos válidos y verificar redirección a `/login`.
- [ ] **Validación de Errores**: Intentar registrar un email ya existente.
- [ ] **Validación de Campos**: Verificar que los mensajes de error aparezcan al dejar campos vacíos o contraseñas cortas.

### 2. Inicio de Sesión (Login)
- [ ] **Flujo Exitoso**: Ingresar credenciales válidas y verificar redirección a la Home (`/`) y persistencia de sesión.
- [ ] **Credenciales Inválidas**: Verificar mensaje de error al usar contraseña incorrecta.
- [ ] **Restricción de Acceso**: Verificar que un usuario ya logueado sea redirigido si intenta entrar a `/login`.

## 📈 Progreso de Implementación

- [x] **Fase 1: Configuración del Entorno**
    - [x] Instalación de `cypress` en `ecommerce-app/`.
    - [x] Creación de `cypress.config.js`.
- [x] **Fase 2: Preparación de Componentes (Selectores)**
    - [x] Añadir `data-cy` a `Input.jsx` y `Button.jsx`.
    - [x] Etiquetar campos en `RegisterForm.jsx`.
    - [x] Etiquetar campos en `LoginForm.jsx`.
- [x] **Fase 3: Desarrollo de Scripts de Prueba**
    - [x] Implementar `cypress/e2e/auth.cy.js`.
- [x] **Fase 4: Ejecución y Verificación**
    - [x] Ejecución exitosa de `npx cypress run`.

---
> **Nota:** Consultar `ecommerce-api/AGENTS.md` para la estructura de la API. Se recomienda interceptar `/api/auth/login` y `/api/auth/register` vía `cy.intercept()` utilizando fixtures locales para los componentes críticos antes de golpear el servidor de base de datos real.
