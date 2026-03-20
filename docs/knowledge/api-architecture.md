# API Architecture & Backend Patterns (Retro-Bits)

This document describes the technical structure, routes, models, and patterns of the Express/MongoDB backend.

## 📂 Backend Structure (`ecommerce-api/src/`)

- `config/database.js`: Mongoose connection.
- `controllers/`: Request/Response handlers. Includes `__tests__` using Vitest.
- `middlewares/`: Security, Authorization, and Validators.
    - `authMiddleware.js`: JWT verification.
    - `rateLimiter.js`: API rate limiting (auth, api, strict).
    - `validators.js`: 40+ request validation functions.
- `models/`: Mongoose schemas (Cart, Category, Order, Product, User, etc.).
- `routes/`: Express router definitions.
- `seed/`: Database seeding scripts.

## 🗺️ API Route Map
Base URL: `http://localhost:{PORT}/api`

### Auth (`/auth`)
- `POST /auth/register`: Register user.
- `POST /auth/login`: Login → `{ token, refreshToken }`.
- `POST /auth/refresh`: Renew access token.
- `GET /auth/check-email?email=...`: Check availability.

### Products (`/products`)
- `GET /products`: List all.
- `GET /products/search`: Search by text.
- `GET /products/:id`: Get details.
- `POST /products`: Create (Admin only).

### Cart (`/cart`)
- `GET /cart/user/:id`: Get user cart.
- `POST /cart/add-product`: Add item.
- `PUT /cart/update-item`: Change quantity.
- `DELETE /cart/remove-item/:productId`: Remove item.

## 🛡️ Coding Patterns & Restrictions

### Controller Pattern (Mandatory)
Always declare `next` as the 3rd parameter and use it in `catch` blocks to ensure global error handling.
```js
const myController = async (req, res, next) => {
  try {
    // Logic here
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error); // Mandatory
  }
};
```

### Restrictions
- **No `require()`**: Use ES Modules (`import/export`).
- **No inline validation**: Use `middlewares/validators.js`.
- **No `res.status(500)`**: Always use `next(error)`.
- **No .env in git**: Keep it local.
