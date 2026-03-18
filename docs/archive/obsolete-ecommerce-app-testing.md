# AGENTS.testing.md - Guía de Testing E2E (ecommerce-app)

Este documento define los estándares y patrones para realizar pruebas de extremo a extremo (E2E) en `ecommerce-app` utilizando **Cypress**.

## 🚀 Instalación de Cypress
Cypress no está preinstalado. Para configurarlo, ejecuta:

```bash
npm install cypress --save-dev
npx cypress open # Para abrir la interfaz interactiva
```

## 🛠️ Comandos Personalizados (`cypress/support/commands.js`)

### `cy.loginByApi(email, password)`
Permite autenticar al usuario directamente mediante la API para saltar el login visual en pruebas que no lo requieren.

```javascript
Cypress.Commands.add("loginByApi", (email, password) => {
  cy.request("POST", `${Cypress.env("apiUrl")}/auth/login`, {
    email,
    password,
  }).then((response) => {
    window.localStorage.setItem("token", response.body.token);
    window.localStorage.setItem("user", JSON.stringify(response.body.user));
    // Sincronizar con AuthContext si es necesario
  });
});
```

### `cy.addProductToCart(productName)`
Añade un producto específico al carrito desde la Home o ProductList.

```javascript
Cypress.Commands.add("addProductToCart", (productName) => {
  cy.contains(".product-card", productName).find("[data-testid=add-to-cart-btn]").click();
});
```

## 🧪 Flujos de Prueba Completos

### 1. Registro de Usuario
```javascript
it("debe registrar un nuevo usuario con éxito", () => {
  cy.visit("/register");
  cy.get("[data-testid=displayName-input]").type("Nuevo Usuario");
  cy.get("[data-testid=email-input]").type("test@cypress.com");
  cy.get("[data-testid=password-input]").type("Password123");
  cy.get("[data-testid=submit-btn]").click();
  cy.url().should("include", "/login");
});
```

### 2. Login de Usuario
```javascript
it("debe iniciar sesión correctamente", () => {
  cy.visit("/login");
  cy.get("[data-testid=email-input]").type("user@test.com");
  cy.get("[data-testid=password-input]").type("password123");
  cy.get("[data-testid=submit-btn]").click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
  cy.get("[data-testid=navbar-user]").should("be.visible");
});
```

### 3. Checkout (4 Fases)
```javascript
it("debe completar el flujo de compra completo", () => {
  cy.loginByApi("user@test.com", "password123");
  cy.addProductToCart("Producto Test");
  cy.get("[data-testid=cart-icon]").click();
  cy.get("[data-testid=checkout-btn]").click();

  // Fase 1: Dirección
  cy.get("[data-testid=address-select]").select("Mi Casa");
  cy.get("[data-testid=next-step-btn]").click();

  // Fase 2: Pago
  cy.get("[data-testid=payment-method-select]").select("Visa ****1234");
  cy.get("[data-testid=next-step-btn]").click();

  // Fase 3: Revisión
  cy.contains("Resumen de la Orden").should("be.visible");
  cy.get("[data-testid=confirm-order-btn]").click();

  // Fase 4: Confirmación
  cy.url().should("include", "/order-confirmation");
  cy.contains("¡Gracias por tu compra!").should("be.visible");
});
```

## 🏷️ Tabla de `data-testid` Requeridos
Para garantizar que los tests no se rompan con cambios de diseño, usa siempre `data-testid`.

| Componente | data-testid Sugerido | Ubicación |
| :--- | :--- | :--- |
| **Input** | `[name]-input` | `src/components/common/Input` |
| **Button** | `[action]-btn` | `src/components/common/Button` |
| **Navbar link** | `nav-[target]-link` | `src/layout/Navbar` |
| **Product Card** | `product-card-[id]` | `src/components/ProductCard` |
| **Cart Items** | `cart-item-[id]` | `src/components/Cart/CartView` |
| **Summary Row** | `summary-[label]` | `src/components/Checkout/shared/SummarySection` |

## 🚫 Restricciones (Lo que NO debes hacer)
- **NO uses selectores de CSS frágiles** (como `.class-a > div > p`). Prefiere `data-testid`.
- **NO dependas de datos reales de producción**. Usa mocks de API (`cy.intercept`) para estados complejos.
- **NO olvides limpiar el estado** entre tests si no usas `cy.loginByApi`.
- **NO dejes tiempos de espera fijos** (`cy.wait(5000)`). Usa aserciones que esperen al elemento.
