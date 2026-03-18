# Testing Standards & Patterns (Retro-Bits)

This document consolidates the testing strategies for both Backend (Unit/Integration) and Frontend (E2E).

## 🛠️ Backend Testing (Vitest)

### Patterns
- Use `createMockReqRes` helper to initialize `req`, `res`, and `next`.
- Explicitly import Vitest globals (`describe`, `it`, `expect`, `vi`).

### Mocking Mongoose
Use `vi.hoisted` for defining mocks that need to be available during `vi.mock`.
```javascript
const { mockModelFindOne, MockModel } = vi.hoisted(() => ({
  mockModelFindOne: vi.fn(),
  MockModel: function(data) { Object.assign(this, data); }
}));
```

## 🚀 Frontend E2E Testing (Cypress)

### Commands
- `cy.loginByApi(email, password)`: Bypass UI login for faster tests.
- `cy.addProductToCart(name)`: Helper for common interaction.

### `data-testid` Standards
Always use `data-testid` for selectors to avoid fragile CSS-based tests.
- Input: `[name]-input`
- Button: `[action]-btn`
- Links: `nav-[target]-link`

## ✅ Mandatory Test Cases
For every new feature:
1. **Happy Path**: Success scenario (200/201).
2. **Client Error (400/404)**: Invalid data or missing resource.
3. **Server Error (500)**: Handling of DB failures via `next(error)`.
4. **Auth**: Protected route/logic validation.
5. **Side Effects**: Verification of DB calls or state updates.
