# App Architecture & Frontend Patterns (Retro-Bits)

This document describes the React 19 structure, contexts, and component patterns of the frontend.

## 📂 Frontend Structure (`ecommerce-app/src/`)

- `components/`: Atomic design components (common, layout, features).
- `context/`: Global state providers (Auth, Cart, Theme).
- `hooks/`: Custom hooks like `useFormReducer`.
- `pages/`: Route-level views. Includes `ProtectedRoute` and `GuestOnly`.
- `services/`: Axios-based API communication (`http.js`).
- `utils/`: Helpers for storage and normalization.

## 🔑 Frontend Routes (`App.jsx`)
- `/`: Home.
- `/cart`: Shopping Cart.
- `/register` / `/login`: Auth pages.
- `/profile`: User Profile (Protected).
- `/checkout`: Checkout flow (Protected).
- `/wishlist`: Favorites (Protected).

## 🧠 Global State (Contexts)

### `useAuth()`
Handles user identity, login/logout, and JWT management.
```js
const { user, isAuth, loading, login, logout } = useAuth();
```

### `useCart()`
Handles items, totals, and synchronization with the API.
```js
const { cartItems, total, addToCart, removeFromCart, clearCart } = useCart();
```

## 🎨 Component Standards

### `<Input>` Props
Requires `id` and `name` for accessibility and `useFormReducer` integration.
```jsx
<Input name="email" label="Email" value={...} onChange={...} onBlur={...} />
```

### `useFormReducer` Hook
The standard way to handle forms in this project.
```js
const { values, onChange, onBlur, handleSubmit } = useFormReducer({ initialValues, validate });
```

## 🚫 Restrictions
- **No inline styles**: Use CSS modules or global classes.
- **No direct localStorage**: Use `storageHelpers.js`.
- **No new contexts**: Use existing ones unless explicitly approved via ADR.
