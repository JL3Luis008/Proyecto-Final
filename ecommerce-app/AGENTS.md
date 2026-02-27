# AGENTS.md — ecommerce-app (Retro-Bits)
> Generado con análisis profundo del código real. Febrero 2026.

---

## 📂 Estructura de `src/`

```
src/
├── components/
│   ├── App/              # App.jsx — router principal (BrowserRouter + Routes)
│   ├── BannerCarousel/
│   ├── Cart/             # CartView.jsx
│   ├── CategoryProducts/
│   ├── Checkout/         # Address/, Payment/, shared/SummarySection
│   ├── List/
│   ├── LoginForm/
│   ├── ProductCard/      # incluye botón Add to Cart
│   ├── ProductDetails/
│   ├── ProfileCard/
│   ├── RegisterForm/
│   ├── SearchResultsList/
│   └── common/           # Badge, Button, ErrorMessage, Icon, Input, Loading
├── context/
│   ├── AuthContext.jsx   # AuthProvider + useAuth()
│   ├── CartContext.jsx   # CartProvider + useCart()
│   ├── ThemeContext.jsx  # ThemeProvider + useTheme()
│   └── cartReducer.js   # reducer + action types del carrito
├── data/                 # datos JSON locales (products, categories, etc.)
├── forms/
├── hooks/
│   └── useFormReducer.js
├── layout/
│   └── Layout.jsx        # Navbar + Outlet
├── pages/
│   ├── Home.jsx, Cart.jsx, Checkout.jsx, Login.jsx, Register.jsx
│   ├── Orders.jsx, OrderConfirmation.jsx, Profile.jsx
│   ├── Product.jsx, ProductDetails.jsx, CategoryPage.jsx
│   ├── SearchResults.jsx, WishList.jsx, Setttings.jsx
│   ├── ProtectedRoute.jsx   # protege rutas con isAuth + allowedRoles
│   └── GuestOnly.jsx        # redirige a / si ya está autenticado
├── services/
│   ├── http.js              # instancia Axios + interceptores (auth + refresh)
│   ├── auth.js              # register, login, refresh, checkEmail
│   ├── cartService.js       # getCart, addToCart, updateItem, removeItem, clearCart
│   ├── productService.js    # getProducts, getProductById, searchProducts
│   ├── userService.js       # checkAuth, getUserProfile
│   ├── categoryService.js
│   ├── paymentMethodService.js
│   ├── shippingAddressService.js
│   └── orderService.js
├── utils/
│   └── storageHelpers.js    # STORAGE_KEYS, readLocalJSON, writeLocalJSON, normalizeAddress, normalizePayment
└── hooks/
    └── useFormReducer.js
```

---

## 🔑 Rutas del Frontend (`App.jsx`)

| Path | Componente | Protegida |
|------|-----------|-----------|
| `/` | `Home` | No |
| `/cart` | `Cart` | No |
| `/register` | `Register` | No |
| `/login` | `Login` | GuestOnly (redirige si ya auth) |
| `/search` | `SearchResults` | No |
| `/product/:productId` | `Product` | No |
| `/category/:categoryId` | `CategoryPage` | No |
| `/profile` | `Profile` | Sí (admin, customer, guest) |
| `/checkout` | `Checkout` | Sí |
| `/wishlist` | `WishList` | Sí |
| `/orders` | `Orders` | Sí |
| `/order-confirmation` | `OrderConfirmation` | No |
| `/settings` | `Settings` | Sí |
| `*` | Not Found div | No |

> **Nota:** `/settings` está duplicado en App.jsx (líneas 77-91).

---

## 🧠 Contextos — API Exacta

### `useAuth()` — desde `AuthContext.jsx`
```js
const {
  user,         // objeto de usuario { displayName, email, role, avatar, ... } | null
  isAuth,       // boolean
  loading,      // boolean — true mientras verifica el token al inicio
  login,        // async (email, password) → { success, user? } | { success: false, error }
  register,     // async (userData) → { success, email?, message }
  logout,       // () → void — elimina tokens del localStorage
  hasRole,      // (role: string) → boolean
  getToken,     // () → string | null — lee 'authToken' de localStorage
} = useAuth();
```

### `useCart()` — desde `CartContext.jsx`
```js
const {
  cartItems,       // array de productos  [{ _id, name, price, quantity, imagesUrl, ... }]
  total,           // number — suma de price * quantity
  addToCart,       // (product) → void
  removeFromCart,  // (productId) → void
  updateQuantity,  // (productId, quantity) → void
  clearCart,       // () → void
  getTotalItems,   // () → number (suma de quantities)
  getTotalPrice,   // () → number
} = useCart();
```

### `useTheme()` — desde `ThemeContext.jsx`
```js
const {
  theme,       // 'light' | 'dark'
  isDarkMode,  // boolean
  toggleTheme, // () → void
  setTheme,    // (theme: string) → void
} = useTheme();
```

---

## 🎨 Componentes `common/` — Props Reales

### `<Button>`
```jsx
<Button
  onClick={fn}
  type="button" | "submit" | "reset"  // default: "button"
  disabled={bool}
  variant="primary" | "secondary" | "danger"
  size="sm" | "md" | "lg"
  className="..."
>
  Texto
</Button>
```

### `<Input>`
```jsx
<Input
  id="field-id"       // requerido para accesibilidad
  name="fieldName"    // requerido para useFormReducer
  label="Etiqueta"
  type="text" | "email" | "password" | ...
  value={values.fieldName}
  placeholder="..."
  onChange={onChange}   // del useFormReducer
  onBlur={onBlur}       // del useFormReducer
  error={getFieldError('fieldName')}
  showError={isTouched('fieldName')}
  autoComplete="..."
/>
```

### `<Badge>`
```jsx
<Badge text="Texto" variant="success"|"info"|"warning"|"danger" className="..." />
```

### `<Loading>`
```jsx
<Loading message="Cargando..." />
```

### `<ErrorMessage>`
```jsx
<ErrorMessage message="Algo salió mal">
  {/* children opcionales */}
</ErrorMessage>
```

---

## 📝 Hook `useFormReducer`

**Importar:**
```js
import { useFormReducer } from '../hooks/useFormReducer';
```

**API completa:**
```js
const {
  values,         // objeto con los valores actuales del formulario
  errors,         // { field: 'msg de error' } — solo si hay errores
  touched,        // { field: bool } — true si el campo fue tocado (blur)
  isSubmitting,   // boolean
  submitError,    // string — error de envío
  onChange,       // handler para e.target — soporta checkboxes
  onBlur,         // handler para e.target
  getFieldError,  // (name: string) → string | undefined
  isTouched,      // (name: string) → boolean
  runValidation,  // () → errors object (y los despacha al estado)
  markAllTouched, // () → marca todos los campos como touched
  handleSubmit,   // async (onSubmit: fn) → void — valida y llama onSubmit si no hay errores
  setSubmitting,  // (bool) → void
  setSubmitError, // (msg: string) → void
  reset,          // () → regresa al estado inicial
} = useFormReducer({ initialValues, validate });
```

**Ejemplo completo:**
```jsx
const INITIAL = { email: '', password: '' };
const validate = (vals) => {
  const errs = {};
  if (!vals.email) errs.email = 'Requerido';
  if (!vals.password) errs.password = 'Requerido';
  return errs;
};

function LoginForm() {
  const { values, onChange, onBlur, getFieldError, isTouched, handleSubmit, isSubmitting, submitError } =
    useFormReducer({ initialValues: INITIAL, validate });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (!result.success) throw new Error(result.error);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit); }}>
      <Input name="email" value={values.email} onChange={onChange} onBlur={onBlur}
             error={getFieldError('email')} showError={isTouched('email')} />
      <Input name="password" type="password" value={values.password} onChange={onChange} onBlur={onBlur}
             error={getFieldError('password')} showError={isTouched('password')} />
      {submitError && <ErrorMessage message={submitError} />}
      <Button type="submit" disabled={isSubmitting}>Entrar</Button>
    </form>
  );
}
```

---

## 🌐 Patrón de Servicio con `http.js`

```js
import { http } from './http';

// GET con query params
export const getProducts = async (params = {}) => {
  const response = await http.get('products', { params });
  return response.data; // { products, pagination, filters }
};

// POST con body
export const createOrder = async (orderData) => {
  const response = await http.post('orders', orderData);
  return response.data;
};
```

> `http.js` ya agrega el header `Authorization: Bearer <token>` automáticamente desde `localStorage.authToken`.
> Si recibe un 401, intenta refrescar el token con `auth/refresh` antes de reintentar.

---

## 🛒 Flujo de Checkout (paso a paso)

1. **Guard**: Si `cartItems` está vacío → `navigate('/cart')` (con `suppressRedirect.ref` para evitar redirect al confirmar)
2. **Carga de datos**: Lee `localStorage[STORAGE_KEYS.addresses]` y `localStorage[STORAGE_KEYS.payments]` vía `readLocalJSON`
3. **Normalización**: `normalizeAddress(addr, idx)` y `normalizePayment(pay, idx)` aseguran estructura consistente
4. **Sección 1 — Dirección**: `AddressList` → selección + `AddressForm` → creación/edición. Persiste con `writeLocalJSON`
5. **Sección 2 — Pago**: `PaymentList` → selección + `PaymentForm` → creación/edición. Persiste con `writeLocalJSON`
6. **Sección 3 — Revisión**: `CartView` muestra los items
7. **Confirmación**: Calcula `subtotal`, `taxAmount (16%)`, `shippingCost (gratis ≥ $1000, $350 si no)`, `grandTotal`
8. **Guardar orden**: Crea objeto `order` con id temporal y lo guarda en `localStorage['orders']`
9. **Limpiar y navegar**: `clearCart()` → `navigate('/order-confirmation', { state: { order } })`

---

## 🚫 Restricciones

- **NO uses estilos inline** — usa CSS modules o las clases globales de `index.css`
- **NO crees nuevos contextos** sin revisión — los 3 existentes (Auth, Cart, Theme) cubren el estado global
- **NO manipules `localStorage` directamente** en componentes — usa los helpers de `storageHelpers.js`
- **NO importes desde rutas relativas frágiles** — usa alias o rutas desde `src/`
- **NO omitas** `id` y `name` en Inputs — son vitales para `useFormReducer` y accesibilidad
- **NO ignores el `loading` state** de AuthContext al montar páginas protegidas — espera a `loading === false`
