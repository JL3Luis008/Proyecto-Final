# AGENTS.md — ecommerce-api (Retro-Bits)
> Generado con análisis profundo del código real. Febrero 2026.

---

## 📂 Estructura de `src/`

```
src/
├── config/
│   └── database.js           # conexión Mongoose
├── controllers/
│   ├── __tests__/            # tests unitarios con Vitest
│   ├── authController.js     # register, login, checkEmail, refreshToken
│   ├── cartController.js     # CRUD carrito + add/update/remove/clear items
│   ├── categoryController.js
│   ├── notificationController.js
│   ├── orderController.js
│   ├── paymentMethodController.js
│   ├── productController.js  # CRUD + search + getByCategory
│   ├── reviewController.js
│   ├── shippingAddressController.js
│   ├── userController.js     # CRUD usuarios + perfil + cambio de contraseña
│   └── wishListController.js
├── middlewares/
│   ├── authMiddleware.js     # verifica JWT de Authorization header
│   ├── isAdminMiddleware.js  # verifica role === 'admin' en req.user
│   ├── errorHandler.js       # Express error handler (4 args)
│   ├── globalErrorHandler.js # captura uncaughtException/unhandledRejection → logs/error.log
│   ├── logger.js
│   ├── rateLimiter.js        # authLimiter (5/15min), apiLimiter (10000/30min), strictLimiter (100/1h)
│   └── validators.js         # 40+ funciones de express-validator
├── models/
│   ├── cart.js       # { user: ObjectId, products: [{ product: ObjectId, quantity }] }
│   ├── category.js   # { name, description, imageURL, parentCategory: ObjectId }
│   ├── notification.js
│   ├── order.js      # { user, products[{ productId, quantity, price }], shippingAddress, paymentMethod, shippingCost, totalPrice, status, paymentStatus }
│   ├── paymentMethod.js
│   ├── product.js    # { name, description, company, price, stock, imagesUrl[], category: ObjectId, rating, reviews[] }
│   ├── review.js
│   ├── shippingAddress.js
│   ├── user.js       # { displayName, email, hashPassword, role(admin|customer|guest), avatar, phone, isActive }
│   └── wishList.js
├── routes/
│   ├── index.js              # agrega todos los routers bajo /api
│   ├── authRoutes.js
│   ├── cartRoutes.js
│   ├── categoryRoutes.js
│   ├── notificationRoutes.js
│   ├── orderRoutes.js
│   ├── paymentMethodRoutes.js
│   ├── productRoutes.js
│   ├── reviewRoutes.js
│   ├── shippingAddressRoutes.js
│   ├── userRoutes.js
│   └── wishListRoutes.js
└── seed/
    └── productsCategories.js  # npm run seedProducts
```

---

## 🗺️ Mapa de Rutas API

Base URL: `http://localhost:{PORT}/api`

### Auth (`/auth`)
| Método | Path | Auth | Admin | Descripción |
|--------|------|:----:|:-----:|-------------|
| POST | `/auth/register` | ✗ | ✗ | Registrar usuario (role default: `guest`) |
| POST | `/auth/login` | ✗ | ✗ | Login → `{ token, refreshToken }` |
| POST | `/auth/refresh` | ✗ | ✗ | Renovar access token con refreshToken |
| GET | `/auth/check-email` | ✗ | ✗ | `?email=...` → `{ taken: bool }` |

### Carrito (`/cart`)
| Método | Path | Auth | Admin |
|--------|------|:----:|:-----:|
| GET | `/cart` | ✓ | ✓ |
| GET | `/cart/user/:id` | ✓ | ✗ |
| POST | `/cart/add-product` | ✓ | ✗ |
| PUT | `/cart/update-item` | ✓ | ✗ |
| DELETE | `/cart/remove-item/:productId` | ✓ | ✗ |
| POST | `/cart/clear` | ✓ | ✗ |

### Productos (`/products`)
| Método | Path | Auth | Admin |
|--------|------|:----:|:-----:|
| GET | `/products` | ✗ | ✗ |
| GET | `/products/search` | ✗ | ✗ |
| GET | `/products/:id` | ✗ | ✗ |
| GET | `/products/category/:idCategory` | ✗ | ✗ |
| POST | `/products` | ✓ | ✓ |
| PUT | `/products/:id` | ✓ | ✓ |
| DELETE | `/products/:id` | ✓ | ✓ |

### Usuarios (`/users`)
| Método | Path | Auth | Admin |
|--------|------|:----:|:-----:|
| GET | `/users/profile` | ✓ | ✗ |
| PUT | `/users/profile` | ✓ | ✗ |
| PUT | `/users/change-password` | ✓ | ✗ |
| DELETE | `/users/deactivate` | ✓ | ✗ |
| GET | `/users` | ✓ | ✓ |
| GET | `/users/search` | ✓ | ✓ |
| GET | `/users/:userId` | ✓ | ✓ |
| POST | `/users` | ✓ | ✓ |
| PUT | `/users/:userId` | ✓ | ✓ |
| PATCH | `/users/:userId/toggle-status` | ✓ | ✓ |

---

## 🏗️ Modelos Mongoose (Campos Principales)

### User
```js
{ displayName: String(req), email: String(req,unique), hashPassword: String(req),
  role: enum['admin','customer','guest'](req), avatar: String(default: placehold.co),
  phone: String(max:10), isActive: Boolean(default:true) }
```

### Product
```js
{ name, description, company, price: Number, stock: Number,
  imagesUrl: [String], category: ObjectId→Category, rating, reviews }
```

### Order
```js
{ user: ObjectId→User, products:[{productId,quantity,price}],
  shippingAddress: ObjectId→ShippingAddress, paymentMethod: ObjectId→PaymentMethod,
  shippingCost: Number(default:0), totalPrice: Number,
  status: enum['pending','processing','shipped','delivered','cancelled'],
  paymentStatus: enum['pending','paid','failed','refunded'] }
```

### Cart
```js
{ user: ObjectId→User, products: [{ product: ObjectId→Product, quantity: Number }] }
```

### Category
```js
{ name: String(req), description: String(req), imageURL: String, parentCategory: ObjectId(nullable) }
```

---

## 🛡️ Middlewares Disponibles

| Import | Uso |
|--------|-----|
| `authMiddleware` | Verifica Bearer token en `Authorization` header → `req.user = { userId, displayName, role }` |
| `isAdmin` | Verifica `req.user.role === 'admin'`, retorna 403 si no |
| `validate` | Procesa errores de `express-validator` y retorna 400 con array de errores |
| `authLimiter` | Max 5 intentos / 15 minutos (para login/register) |
| `apiLimiter` | Max 10,000 req / 30 min (general) |
| `strictLimiter` | Max 100 req / hora (para ops sensibles) |

---

## 🛠️ Validadores Disponibles (`src/middlewares/validators.js`)

Todos son importados con `import { ... } from '../middlewares/validators.js'`.

| Función | Valida |
|---------|--------|
| `emailValidation(optional?)` | body.email — formato y normalización |
| `passwordValidation()` | body.password — min 6 chars, 1 número, 1 letra |
| `passwordLoginValidation()` | body.password — solo `notEmpty` |
| `fullPasswordValidation(required?)` | body.password — validación completa |
| `newPasswordValidation()` | body.newPassword |
| `confirmPasswordValidation()` | body.confirmPassword === body.newPassword |
| `displayNameValidation(optional?)` | body.displayName — 2-50 chars |
| `phoneValidation()` | body.phone — exactamente 10 dígitos |
| `mongoIdValidation(field, label?)` | param[field] — ObjectId válido |
| `bodyMongoIdValidation(field, label, optional?)` | body[field] — ObjectId válido |
| `paginationValidation()` | query.page, query.limit |
| `priceValidation(field?)` | body[field] — float ≥ 0 |
| `priceOptionalValidation(field?)` | body[field] — float ≥ 0, opcional |
| `stockValidation()` | body.stock — int ≥ 0 |
| `stockOptionalValidation()` | body.stock — opcional |
| `quantityValidation(field?, optional?)` | body[field] — int ≥ 1 |
| `imagesUrlValidation(required?)` | body.imagesUrl — array de URLs |
| `productNameValidation(required?)` | body.name — 2-100 chars |
| `productDescriptionValidation(required?)` | body.description — 10-1000 chars |
| `ratingValidation(optional?)` | body.rating — int 1-5 |
| `commentValidation(field?, maxLength?)` | body[field] |
| `orderStatusValidation(optional?)` | body.status — enum válido |
| `paymentStatusValidation(optional?)` | body.paymentStatus — enum válido |
| `paymentTypeValidation()` | body.type — enum válido |
| `roleValidation()` | body.role — admin\|customer\|guest |
| `nameValidation(field?)` | body[field] — 2-100 chars |
| `addressLineValidation()` | body.address — 5-200 chars |
| `cityValidation()` | body.city — solo letras |
| `stateValidation()` | body.state — solo letras |
| `postalCodeValidation()` | body.postalCode — 4-6 dígitos |
| `countryValidation()` | body.country — opcional |
| `addressTypeValidation()` | body.addressType — home\|work\|other |
| `addressPhoneValidation()` | body.phone — 10-15 chars |
| `queryEmailValidation()` | query.email |
| `searchQueryValidation(field?, min?, max?)` | query[field] |
| `sortFieldValidation(allowedFields)` | query.sort — enum dinámico |
| `orderValidation()` | query.order — asc\|desc |
| `queryMongoIdValidation(field, label)` | query[field] — ObjectId |
| `queryPriceValidation(field)` | query[field] — float ≥ 0 |
| `queryBooleanValidation(field)` | query[field] — 'true'\|'false' |
| `queryRoleValidation()` | query.role — enum válido |
| `queryIsActiveValidation()` | query.isActive — 'true'\|'false' |
| `generalNameValidation(field?, required?, maxLength?)` | body[field] |
| `descriptionValidation(field?)` | body[field] — max 2000 chars |
| `booleanValidation(field)` | body[field] — boolean |

---

## 🧩 Patrones de Código

### Controlador (patrón CORRECTO)
```js
// ✅ SIEMPRE declarar `next` como 3er parámetro
const myController = async (req, res, next) => {
  try {
    const { field } = req.body;  // o req.params / req.query
    const result = await Model.findById(field);
    if (!result) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Success', result });
  } catch (error) {
    next(error); // NUNCA omitir — pasa al errorHandler global
  }
};
```

### Ruta (patrón CORRECTO)
```js
router.post(
  '/my-route',
  authMiddleware,            // si requiere login
  isAdmin,                   // si requiere admin
  [emailValidation(), passwordValidation()],  // validadores
  validate,                  // procesa resultados de expresss-validator
  myController
);
```

---

## 🚫 Restricciones

- **NO uses `require()`** — el proyecto usa ES Modules (`import/export`)
- **NO omitas `next` como parámetro** en los controladores — genera `ReferenceError` en producción
- **NO hagas validación inline** con `if(!field)` — usa los validators de `middlewares/validators.js` + `validate`
- **NO llames `res.status(500)` directamente** en controllers — usa `next(error)` para que el errorHandler lo gestione
- **NO commites el `.env`** — usa variables de entorno seguras
- **NO crees nuevas conexiones a BD** — usa `src/config/database.js` existente
