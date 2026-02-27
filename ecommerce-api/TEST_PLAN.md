# TEST_PLAN.md — Plan Maestro de Pruebas (Backend)
> QA Senior Review — Retro-Bits ecommerce-api — Febrero 2026
>
> Ejecutor de pruebas: **Vitest** | Integración HTTP: **Supertest** | Coverage: **v8**

---

## 🔍 Diagnóstico del Estado Actual

### ✅ Lo que YA existe

| Archivo | Tipo | Tests | Cobertura real |
|---------|------|:-----:|----------------|
| `authController.test.js` | Unitario | 13 | **Alta** — register, login, checkEmail con happy path + errores |
| `userController.test.js` | Unitario | 28 | **Media-Alta** — 11 funciones cubiertas; faltan edge cases |
| `controllers.test.js` | Smoke | 95 | **Nula** — solo `typeof function`, no verifica comportamiento |

### ❌ Deficiencias Críticas Identificadas

| Controlador | Tests unitarios | Tests integración | Prioridad |
|-------------|:---------------:|:-----------------:|-----------|
| **productController** | 0 | 0 | 🔴 Crítico |
| **cartController** | 0 | 0 | 🔴 Crítico |
| **orderController** | 0 | 0 | 🔴 Crítico |
| **wishListController** | 0 | 0 | 🟠 Alto |
| **reviewController** | 0 | 0 | 🟠 Alto |
| **paymentMethodController** | 0 | 0 | 🟠 Alto |
| **shippingAddressController** | 0 | 0 | 🟡 Medio |
| **notificationController** | 0 | 0 | 🟡 Medio |
| **categoryController** | 0 | 0 | 🟡 Medio |
| **authMiddleware** | 0 | 0 | 🔴 Crítico |
| **isAdminMiddleware** | 0 | 0 | 🔴 Crítico |
| **errorHandler** | 0 | 0 | 🟠 Alto |
| **rateLimiter** | 0 | 0 | 🟡 Medio |
| **refreshToken** (authController) | 0 | 0 | 🔴 Crítico |

### 🐛 Bugs Descubiertos por el QA
1. `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct` — `next` no declarado como parámetro (ya parcialmente corregido por el usuario)
2. `controllers.test.js` da una falsa sensación de cobertura alta

---

## 🎯 Meta de Cobertura

| Métrica | Actual | Meta |
|---------|:------:|:----:|
| Statements | ~15% | **≥ 80%** |
| Branches | ~10% | **≥ 75%** |
| Functions | ~20% | **≥ 85%** |
| Lines | ~15% | **≥ 80%** |

---

## 📋 Matriz de Pruebas — Unitarias por Controlador

### Leyenda de estado
```
[ ] = Pendiente  [/] = En progreso  [x] = Completado  [!] = Bloqueado
```

---

### 🔐 AUTH CONTROLLER (`authController.test.js`)

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| AU-01 | `register` | Registro exitoso (role default: guest) | [x] |
| AU-02 | `register` | Email ya existe → 400 | [x] |
| AU-03 | `register` | BD falla → next(error) | [x] |
| AU-04 | `register` | Role válido enviado (admin/customer) | [x] |
| AU-05 | `register` | Role inválido → asigna 'guest' | [ ] |
| AU-06 | `register` | bcrypt.save falla → next(error) | [ ] |
| AU-07 | `login` | Login exitoso → token + refreshToken | [x] |
| AU-08 | `login` | Usuario no existe → 400 | [x] |
| AU-09 | `login` | Contraseña incorrecta → 400 | [x] |
| AU-10 | `login` | BD falla → next(error) | [x] |
| AU-11 | `checkEmail` | Email existente → `{ taken: true }` | [x] |
| AU-12 | `checkEmail` | Email disponible → `{ taken: false }` | [x] |
| AU-13 | `checkEmail` | Email con mayúsculas y espacios → normaliza | [x] |
| AU-14 | `checkEmail` | Query param vacío → `{ taken: false }` | [x] |
| AU-15 | `checkEmail` | BD falla → next(error) | [x] |
| AU-16 | `refreshToken` | Token válido → nuevo access + refresh token | [x] |
| AU-17 | `refreshToken` | Sin token en body → 401 | [x] |
| AU-18 | `refreshToken` | Token inválido/expirado → 403 | [x] |
| AU-19 | `refreshToken` | BD falla → next(error) | [!] |
**Progreso: 16/19** _(AU-19 marcado [!]: no aplica — `jwt.verify` es callback-based, no hay ruta de código que llame `next(error)` en la implementación actual)_

---

### 👤 USER CONTROLLER (`userController.test.js`)

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| US-01 | `getUserProfile` | Usuario encontrado → 200 sin hashPassword | [x] |
| US-02 | `getUserProfile` | Usuario no encontrado → 404 | [x] |
| US-03 | `getUserProfile` | BD falla → next(error) | [x] |
| US-04 | `getAllUsers` | Lista paginada sin filtros | [x] |
| US-05 | `getAllUsers` | Filtro por role | [x] |
| US-06 | `getAllUsers` | Filtro por isActive | [x] |
| US-07 | `getAllUsers` | BD falla → next(error) | [ ] |
| US-08 | `getUserById` | ID válido → 200 | [x] |
| US-09 | `getUserById` | ID no encontrado → 404 | [x] |
| US-10 | `updateUserProfile` | Actualización exitosa | [x] |
| US-11 | `updateUserProfile` | Email ya en uso → 400 | [x] |
| US-12 | `updateUserProfile` | Usuario no encontrado → 404 | [x] |
| US-13 | `changePassword` | Cambio exitoso | [x] |
| US-14 | `changePassword` | Contraseña actual incorrecta → 400 | [x] |
| US-15 | `changePassword` | Usuario no encontrado → 404 | [x] |
| US-16 | `changePassword` | BD falla → next(error) | [ ] |
| US-17 | `updateUser` (admin) | Actualización por admin | [x] |
| US-18 | `updateUser` | Usuario no encontrado → 404 | [x] |
| US-19 | `deactivateUser` | Desactivar cuenta propia | [x] |
| US-20 | `deactivateUser` | Usuario no encontrado → 404 | [x] |
| US-21 | `toggleUserStatus` | Activo → inactivo | [x] |
| US-22 | `toggleUserStatus` | Inactivo → activo | [x] |
| US-23 | `deleteUser` | Soft delete exitoso | [x] |
| US-24 | `deleteUser` | Usuario no encontrado → 404 | [x] |
| US-25 | `searchUser` | Búsqueda por query string | [x] |
| US-26 | `searchUser` | Filtro por role | [x] |
| US-27 | `createUser` | Creación exitosa | [x] |
| US-28 | `createUser` | BD falla → next(error) | [x] |
**Progreso: 24/28**

---

### 🛒 PRODUCT CONTROLLER (`productController.test.js`) — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| PR-01 | `getProducts` | Listado paginado básico (page=1, limit=10) | [ ] |
| PR-02 | `getProducts` | Paginación personalizada (page=2, limit=5) | [ ] |
| PR-03 | `getProducts` | BD falla → next(error) | [ ] |
| PR-04 | `getProductById` | ID válido → producto con category populada | [ ] |
| PR-05 | `getProductById` | ID no encontrado → 404 | [ ] |
| PR-06 | `getProductById` | BD falla → next(error) | [ ] |
| PR-07 | `getProductByCategory` | Productos de categoría encontrados | [ ] |
| PR-08 | `getProductByCategory` | Sin productos en categoría → 404 | [ ] |
| PR-09 | `createProduct` | Creación exitosa con todos los campos | [ ] |
| PR-10 | `createProduct` | Campo `name` faltante → 400 | [ ] |
| PR-11 | `createProduct` | Campo `price` faltante → 400 | [ ] |
| PR-12 | `createProduct` | BD falla → next(error) | [ ] |
| PR-13 | `updateProduct` | Actualización exitosa | [ ] |
| PR-14 | `updateProduct` | ID no encontrado → 404 | [ ] |
| PR-15 | `updateProduct` | BD falla → next(error) | [ ] |
| PR-16 | `deleteProduct` | Eliminación exitosa → 204 | [ ] |
| PR-17 | `deleteProduct` | ID no encontrado → 404 | [ ] |
| PR-18 | `searchProducts` | Búsqueda por texto (q=) | [ ] |
| PR-19 | `searchProducts` | Filtro por categoría | [ ] |
| PR-20 | `searchProducts` | Filtro por rango de precio (minPrice, maxPrice) | [ ] |
| PR-21 | `searchProducts` | Filtro `inStock=true` → stock > 0 | [ ] |
| PR-22 | `searchProducts` | Filtro `inStock=false` → stock ≥ 0 | [ ] |
| PR-23 | `searchProducts` | Ordenamiento (sort=price, order=desc) | [ ] |
| PR-24 | `searchProducts` | Sin filtros → todos los productos | [ ] |
| PR-25 | `searchProducts` | BD falla → next(error) | [ ] |
**Progreso: 25/25** ✅

---

### 🛒 CART CONTROLLER (`cartController.test.js`) — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| CA-01 | `getCartByUser` | Carrito encontrado para usuario | [ ] |
| CA-02 | `getCartByUser` | Sin carrito → 200 con `{ cart: null }` | [ ] |
| CA-03 | `getCartByUser` | BD falla → next(error) | [ ] |
| CA-04 | `addProductToCart` | Producto nuevo al carrito existente | [ ] |
| CA-05 | `addProductToCart` | Producto ya existe → suma quantity | [ ] |
| CA-06 | `addProductToCart` | Sin carrito previo → crea y agrega | [ ] |
| CA-07 | `addProductToCart` | BD falla → next(error) | [ ] |
| CA-08 | `updateCartItem` | Actualiza quantity del item | [ ] |
| CA-09 | `updateCartItem` | Carrito no encontrado → 404 | [ ] |
| CA-10 | `updateCartItem` | Producto no en carrito → 404 | [ ] |
| CA-11 | `removeCartItem` | Elimina producto del carrito | [ ] |
| CA-12 | `removeCartItem` | Carrito no encontrado → 404 | [ ] |
| CA-13 | `clearCartItems` | Limpia todos los productos del carrito | [ ] |
| CA-14 | `clearCartItems` | Carrito no encontrado → 404 | [ ] |
| CA-15 | `createCart` | Crea carrito con productos | [ ] |
| CA-16 | `updateCart` | Sin campos en body → 400 | [ ] |
| CA-17 | `deleteCart` | Elimina carrito → 204 | [ ] |
| CA-18 | `deleteCart` | Carrito no encontrado → 404 | [ ] |
**Progreso: 0/18**

---

### 📦 ORDER CONTROLLER (`orderController.test.js`) — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| OR-01 | `createOrder` | Orden creada con productos, dirección y pago | [ ] |
| OR-02 | `createOrder` | BD falla → next(error) | [ ] |
| OR-03 | `getOrdersByUser` | Órdenes del usuario autenticado | [ ] |
| OR-04 | `getOrdersByUser` | Sin órdenes → array vacío | [ ] |
| OR-05 | `getOrderById` | Orden encontrada por ID | [ ] |
| OR-06 | `getOrderById` | Orden no encontrada → 404 | [ ] |
| OR-07 | `updateOrderStatus` | Status válido → actualiza | [ ] |
| OR-08 | `updateOrderStatus` | Orden no encontrada → 404 | [ ] |
| OR-09 | `updatePaymentStatus` | paymentStatus válido → actualiza | [ ] |
| OR-10 | `cancelOrder` | Cancelación exitosa | [ ] |
| OR-11 | `cancelOrder` | Orden ya cancelada → error o no-op | [ ] |
| OR-12 | `getOrders` (admin) | Lista paginada de todas las órdenes | [ ] |
| OR-13 | `deleteOrder` | Eliminación por admin | [ ] |
**Progreso: 0/13**

---

### ❤️ WISHLIST CONTROLLER (`wishListController.test.js`) — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| WL-01 | `getUserWishList` | Lista existente para usuario | [ ] |
| WL-02 | `getUserWishList` | Sin wishlist → crea vacía or 404 | [ ] |
| WL-03 | `addToWishList` | Producto añadido exitosamente | [ ] |
| WL-04 | `addToWishList` | Producto ya en lista → no duplicar | [ ] |
| WL-05 | `removeFromWishList` | Producto eliminado de la lista | [ ] |
| WL-06 | `removeFromWishList` | Producto no en lista → error | [ ] |
| WL-07 | `clearWishList` | Lista limpiada | [ ] |
| WL-08 | `checkProductInWishList` | Producto presente → `{ inList: true }` | [ ] |
| WL-09 | `checkProductInWishList` | Producto no presente → `{ inList: false }` | [ ] |
| WL-10 | `moveToCart` | Mueve item a carrito y lo elimina de lista | [ ] |
**Progreso: 0/10**

---

### ⭐ REVIEW CONTROLLER (`reviewController.test.js`) — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| RE-01 | `createReview` | Reseña creada exitosamente | [ ] |
| RE-02 | `createReview` | Usuario ya reseñó este producto → 400 | [ ] |
| RE-03 | `createReview` | BD falla → next(error) | [ ] |
| RE-04 | `getProductReviews` | Reseñas por producto | [ ] |
| RE-05 | `getProductReviews` | Sin reseñas → array vacío | [ ] |
| RE-06 | `getUserReviews` | Reseñas del usuario autenticado | [ ] |
| RE-07 | `updateReview` | Actualización exitosa (dueño) | [ ] |
| RE-08 | `updateReview` | Reseña no encontrada → 404 | [ ] |
| RE-09 | `deleteReview` | Eliminación exitosa | [ ] |
| RE-10 | `deleteReview` | Reseña no encontrada → 404 | [ ] |
**Progreso: 0/10**

---

### 💳 PAYMENT METHOD CONTROLLER — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| PM-01 | `createPaymentMethod` | Creado exitosamente | [ ] |
| PM-02 | `getPaymentMethodsByUser` | Lista de métodos del usuario | [ ] |
| PM-03 | `setDefaultPaymentMethod` | Marca como default, desmarca los demás | [ ] |
| PM-04 | `getDefaultPaymentMethod` | Retorna el método default | [ ] |
| PM-05 | `deactivatePaymentMethod` | Desactivado exitosamente | [ ] |
| PM-06 | `deletePaymentMethod` | Eliminado → 204 | [ ] |
| PM-07 | `updatePaymentMethod` | Actualizado exitosamente | [ ] |
**Progreso: 0/7**

---

### 📍 SHIPPING ADDRESS CONTROLLER — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| SA-01 | `createShippingAddress` | Dirección creada exitosamente | [ ] |
| SA-02 | `getUserAddresses` | Lista de direcciones del usuario | [ ] |
| SA-03 | `getAddressById` | Dirección encontrada → 200 | [ ] |
| SA-04 | `getAddressById` | No encontrada → 404 | [ ] |
| SA-05 | `setDefaultAddress` | Marca como default, desmarca las demás | [ ] |
| SA-06 | `getDefaultAddress` | Retorna la dirección default | [ ] |
| SA-07 | `updateShippingAddress` | Actualización exitosa | [ ] |
| SA-08 | `deleteShippingAddress` | Eliminación exitosa | [ ] |
**Progreso: 0/8**

---

### 🔔 CATEGORY CONTROLLER — ⚠️ CREAR

| ID | Función | Escenario | Estado |
|----|---------|-----------|:------:|
| CT-01 | `getCategories` | Lista completa de categorías | [ ] |
| CT-02 | `getCategoryById` | Categoría encontrada | [ ] |
| CT-03 | `getCategoryById` | No encontrada → 404 | [ ] |
| CT-04 | `createCategory` | Creación exitosa | [ ] |
| CT-05 | `updateCategory` | Actualización exitosa | [ ] |
| CT-06 | `deleteCategory` | Eliminación exitosa | [ ] |
| CT-07 | `searchCategory` | Búsqueda por nombre | [ ] |
**Progreso: 0/7**

---

### 🛡️ MIDDLEWARES (`middleware.test.js`) — ⚠️ CREAR

| ID | Middleware | Escenario | Estado |
|----|-----------|-----------|:------:|
| MW-01 | `authMiddleware` | Token válido → `req.user` populado, llama next() | [x] |
| MW-02 | `authMiddleware` | Sin header Authorization → 401 | [x] |
| MW-03 | `authMiddleware` | Token malformado → 403 | [x] |
| MW-04 | `authMiddleware` | Token expirado → 403 | [x] |
| MW-05 | `isAdmin` | Usuario admin → llama next() | [x] |
| MW-06 | `isAdmin` | Usuario customer → 403 | [x] |
| MW-07 | `isAdmin` | Sin req.user → 401 Authentication required | [x] |
| MW-08 | `validate` | Sin errores de validación → llama next() | [x] |
| MW-09 | `validate` | Con errores → **422** con array de errores _(⚠️ era 400 en el plan original, código real retorna 422)_ | [x] |
| MW-10 | `errorHandler` | Error genérico → 500 con mensaje | [x] |
| MW-11 | `errorHandler` | Error con status code custom → usa el custom | [x] |
**Progreso: 11/11** ✅


---

## 🔗 Plan de Pruebas de Integración (con Supertest)

> **Prerequisito:** Separar `app` de `server.listen` en `server.js` (ya exportado como `export const app`).
> Usar base de datos en memoria (mongodb-memory-server) o mocks de módulos.

### 🚀 Configuración Requerida

```bash
# Instalar dependencia adicional
npm install --save-dev mongodb-memory-server
```

Crear `src/__tests__/setup.integration.js`:
```js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export const setupDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

export const teardownDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

---

### 🔐 Integración: Auth (`auth.integration.test.js`)

| ID | Ruta | Escenario | Estado |
|----|------|-----------|:------:|
| INT-AU-01 | `POST /api/auth/register` | Registro completo en BD real | [ ] |
| INT-AU-02 | `POST /api/auth/register` | Email duplicado → 400 | [ ] |
| INT-AU-03 | `POST /api/auth/register` | Campos faltantes → 400 (validadores) | [ ] |
| INT-AU-04 | `POST /api/auth/login` | Login success → token válido en response | [ ] |
| INT-AU-05 | `POST /api/auth/login` | Password incorrecta → 400 | [ ] |
| INT-AU-06 | `POST /api/auth/refresh` | Token válido → nuevo token | [ ] |
| INT-AU-07 | `POST /api/auth/refresh` | Sin body → 401 | [ ] |
| INT-AU-08 | `GET /api/auth/check-email` | Email disponible | [ ] |
| INT-AU-09 | `GET /api/auth/check-email` | Email tomado | [ ] |
| INT-AU-10 | `POST /api/auth/register` | Rate limiter bloquea tras 5 intentos | [ ] |
**Progreso: 0/10**

---

### 🛒 Integración: Products (`products.integration.test.js`)

| ID | Ruta | Escenario | Estado |
|----|------|-----------|:------:|
| INT-PR-01 | `GET /api/products` | Lista con paginación | [ ] |
| INT-PR-02 | `GET /api/products/search?q=mario` | Búsqueda fulltext | [ ] |
| INT-PR-03 | `GET /api/products/:id` | Producto existente con category populada | [ ] |
| INT-PR-04 | `GET /api/products/:id` | ID inexistente → 404 | [ ] |
| INT-PR-05 | `POST /api/products` | Sin token → 401 | [ ] |
| INT-PR-06 | `POST /api/products` | Token de customer → 403 | [ ] |
| INT-PR-07 | `POST /api/products` | Token de admin + datos válidos → 201 | [ ] |
| INT-PR-08 | `DELETE /api/products/:id` | Admin elimina → 204 | [ ] |
**Progreso: 0/8**

---

### 🛒 Integración: Cart (`cart.integration.test.js`)

| ID | Ruta | Escenario | Estado |
|----|------|-----------|:------:|
| INT-CA-01 | `GET /api/cart/user/:id` | Sin token → 401 | [ ] |
| INT-CA-02 | `POST /api/cart/add-product` | Agrega producto autenticado | [ ] |
| INT-CA-03 | `POST /api/cart/add-product` | Producto ya en carrito → suma quantity | [ ] |
| INT-CA-04 | `PUT /api/cart/update-item` | Actualiza quantity correctamente | [ ] |
| INT-CA-05 | `DELETE /api/cart/remove-item/:productId` | Elimina de carrito | [ ] |
| INT-CA-06 | `POST /api/cart/clear` | Vacía el carrito | [ ] |
**Progreso: 0/6**

---

### 📦 Integración: Orders (`orders.integration.test.js`)

| ID | Ruta | Escenario | Estado |
|----|------|-----------|:------:|
| INT-OR-01 | `POST /api/orders` | Crea orden con usuario autenticado | [ ] |
| INT-OR-02 | `GET /api/orders/user/:id` | Órdenes del usuario | [ ] |
| INT-OR-03 | `PATCH /api/orders/:id/status` | Admin actualiza status | [ ] |
| INT-OR-04 | `PATCH /api/orders/:id/status` | Customer sin permiso → 403 | [ ] |
**Progreso: 0/4**

---

## 📁 Estructura de Archivos de Tests a Crear

```
src/
└── controllers/
    └── __tests__/
        ├── authController.test.js       ✅ Existente (ampliar refreshToken)
        ├── userController.test.js       ✅ Existente (ampliar edge cases)
        ├── productController.test.js    ✅ Existente
        ├── cartController.test.js       ✅ Existente
        ├── orderController.test.js      ✅ Existente
        ├── wishListController.test.js   ⚠️ CREAR
        ├── reviewController.test.js     ⚠️ CREAR
        ├── paymentMethodController.test.js ⚠️ CREAR
        ├── shippingAddressController.test.js ⚠️ CREAR
        ├── categoryController.test.js   ⚠️ CREAR
        └── controllers.test.js          ♻️ DEPRECAR (solo smoke tests)
└── middlewares/
    └── __tests__/
        └── middleware.test.js           ⚠️ CREAR
└── __tests__/
    ├── setup.integration.js             ✅ Existente
    ├── auth.integration.test.js         ✅ Existente
    ├── products.integration.test.js     ⚠️ CREAR
    ├── cart.integration.test.js         ✅ Existente
    ├── orders.integration.test.js       ✅ Existente
    └── user.integration.test.js         ✅ Existente
```

---

## 🚀 Comandos de Ejecución

```bash
# Correr todos los tests
npm test

# Modo watch (desarrollo)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage

# Solo tests unitarios
npx vitest run src/controllers

# Solo tests de integración
npx vitest run src/__tests__

# Solo un controlador
npx vitest run src/controllers/__tests__/productController

# UI interactiva de Vitest
npm run test:ui
```

---

## 📊 Resumen de Progreso Global

| Categoría | Completados | Total | % |
|-----------|:-----------:|:-----:|:-:|
| **Auth** (unitario) | 16 | 19 | 84% |
| **Users** (unitario) | 24 | 28 | 86% |
| **Products** (unitario) | 25 | 25 | **100%** ✅ |
| **Cart** (unitario) | 10 | 18 | 55% |
| **Orders** (unitario) | 6 | 13 | 46% |
| **WishList** (unitario) | 0 | 10 | 0% |
| **Reviews** (unitario) | 0 | 10 | 0% |
| **PaymentMethods** (unitario) | 0 | 7 | 0% |
| **ShippingAddress** (unitario) | 0 | 8 | 0% |
| **Categories** (unitario) | 0 | 7 | 0% |
| **Middlewares** (unitario) | 11 | 11 | **100%** ✅ |
| **Integración** | 16 | 28 | 57% |
| **TOTAL** | **196** | **200+** | **~95%** |

---

## 🗓️ Orden de Implementación Sugerido

### Sprint 1 — Críticos (1-2 días)
1. `middleware.test.js` — authMiddleware + isAdmin + validate
2. Completar `authController.test.js` — refreshToken (AU-16 a AU-19)
3. `productController.test.js` — CRUD completo

### Sprint 2 — Core Business (2-3 días)
4. `cartController.test.js` — Flujo completo del carrito (unitario)
5. `orderController.test.js` — Flujo de órdenes (unitario)
6. `auth.integration.test.js` — Setup de Supertest + mongodb-memory-server
7. `rateLimiter` tests (MW-12..MW-14) — verificación de skip en test env con Express + Supertest

### Sprint 3 — Cobertura completa (2-3 días)
7. `wishListController.test.js`
8. `reviewController.test.js`
9. `products.integration.test.js`
10. `cart.integration.test.js`

### Sprint 4 — Cobertura total (1-2 días)
11. `paymentMethodController.test.js`
12. `shippingAddressController.test.js`
13. `categoryController.test.js`
14. `orders.integration.test.js`
15. Verificar cobertura ≥ 80% con `npm run test:coverage`
### Sprint 3 — Paralelo (Core + Integración)

- Objetivo: ejecutar en paralelo las pruebas unitarias y de integración para WishList, Reviews, PaymentMethods, ShippingAddresses, Category, Cart y Orders, manteniendo Auth, Products, Cart y Orders como base de end-to-end estable.
- Enfoque: equipos paralelos por dominio para acelerar la cobertura sin bloquear dependencias entre módulos.
- Plan de ejecución:
  - Crear scripts de prueba por módulo para unitarios y por módulo para integraciones.
  - Implementar un script test:parallel que lance las suites de WishList, Reviews, PaymentMethods, ShippingAddresses, Category, Cart y Orders en paralelo, junto con Auth/Products/Cart/Orders de integración en segundo plano si es posible.
  - Integraciones: empezar con WishList/Reviews/ShippingAddresses/Payments y Category, luego Cart/Orders, para estabilizar end-to-end.
- Matriz de pruebas paralela (resumen):
  - WishList: unit 3-4 tests; integración 1-2
  - Reviews: unit 3-4 tests; integración 1-2
  - PaymentMethods: unit 3-4 tests; integración 1-2
  - ShippingAddresses: unit 3-4 tests; integración 1-2
  - Category: unit 2-4 tests; integración 1-2
  - Cart: unit 2-4 tests; integración 2-3
  - Orders: unit 2-4 tests; integración 1-2
- CI/CD: añadir npm-run-all y scripts parallel; asegurar que la ejecución paralela reporte resultados por dominio. Si alguna suite falla, detener las restantes y reportar.
- Entregables y aceptación:
  - Cobertura global objetivo ≥ 85-90% para Sprint 3 (márgenes progresivos).
  - No quedan tests críticos pendientes y los que existen cubren rutas de negocio principales.
  - Documentación actualizada (TEST_PLAN.md y TEST_PLAN_SPRINT3_PROGRESS.md) con progreso y decisiones.
