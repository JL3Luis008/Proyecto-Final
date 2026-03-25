# BACKLOG CONSOLIDADO — Proyecto Final Ecommerce

> **Última auditoría:** 2026-03-24  
> **Fuente de verdad:** Código real en `ecommerce-api/` y `ecommerce-app/`  
> **Metodología:** Inspección directa de rutas, controladores, servicios, contextos y páginas. No se infiere de documentación previa.

---

## 1. ESTADO DE INTEGRACIÓN FE-BE

### 1.1 Completamente Integradas (FE ↔ BE funcionando)

| Funcionalidad | Servicio FE | Endpoint BE | Método | Observaciones |
|---|---|---|---|---|
| **Login** | `auth.js → login()` | `POST /auth/login` | ✅ | Token + refreshToken a localStorage |
| **Registro** | `auth.js → register()` | `POST /auth/register` | ✅ | Validators completos en BE |
| **Logout** | `auth.js → logout()` | `POST /auth/logout` | ✅ | Revoca token en BE |
| **Refresh token** | `auth.js → refresh()` | `POST /auth/refresh` | ✅ | Implementado en http.js |
| **Check email disponible** | `auth.js → checkEmail()` | `GET /auth/check-email` | ✅ | |
| **Perfil de usuario** | `userService → getUserProfile()` | `GET /users/profile` | ✅ | |
| **Actualizar perfil** | `userService → updateUserProfile()` | `PUT /users/profile` | ✅ | |
| **Cambiar contraseña** | `userService → changePassword()` | `PUT /users/change-password` | ✅ | |
| **Subir avatar** | `userService → uploadUserProfileImage()` | `POST /users/profile/upload` | ✅ | Multer en BE |
| **Listar productos** | `productService → getProducts()` | `GET /products` | ✅ | Con paginación |
| **Detalle de producto** | `productService → getProductById()` | `GET /products/:id` | ✅ | |
| **Buscar productos** | `productService → searchProducts()` | `GET /products/search` | ✅ | Filtros: category, price, inStock, sort |
| **Productos por categoría** | `productService → getProductsByCategoryId()` | `GET /products/search?category=` | ✅ | Usa search con filtro |
| **Crear producto (admin)** | `productService → createProduct()` | `POST /products` | ✅ | |
| **Editar producto (admin)** | `productService → updateProduct()` | `PUT /products/:id` | ✅ | |
| **Eliminar producto (admin)** | `productService → deleteProduct()` | `DELETE /products/:id` | ✅ | |
| **Subir imagen de producto** | `productService → uploadProductImage()` | `POST /products/upload` | ✅ | |
| **Reseñas: obtener** | `productService → getProductReviews()` | `GET /products/:id/reviews` | ✅ | |
| **Reseñas: agregar** | `productService → addProductReview()` | `POST /products/:id/reviews` | ✅ | |
| **Listar categorías** | `categoryService → fetchCategories()` | `GET /categories` | ✅ | |
| **Categoría por ID** | `categoryService → getCategoryById()` | `GET /categories/:id` | ✅ | |
| **Buscar categorías** | `categoryService → searchCategories()` | `GET /categories/search` | ✅ | |
| **Subcategorías** | `categoryService → getChildCategories()` | `GET /categories/search?parentCategory=` | ✅ | |
| **Wishlist: obtener** | `wishlistService → getWishlist()` | `GET /wishList` | ✅ | |
| **Wishlist: agregar** | `wishlistService → addToWishlist()` | `POST /wishList/add` | ✅ | |
| **Wishlist: eliminar** | `wishlistService → removeFromWishlist()` | `DELETE /wishList/remove/:productId` | ✅ | |
| **Métodos de pago: listar** | `paymentMethodService → getMyPaymentMethods()` | `GET /payment-methods/me` | ✅ | |
| **Métodos de pago: crear** | `paymentMethodService → createPaymentMethod()` | `POST /payment-methods` | ✅ | |
| **Métodos de pago: editar** | `paymentMethodService → updatePaymentMethod()` | `PUT /payment-methods/:id` | ✅ | |
| **Métodos de pago: eliminar** | `paymentMethodService → deletePaymentMethod()` | `DELETE /payment-methods/:id` | ✅ | |
| **Métodos de pago: default** | `paymentMethodService → setDefaultPaymentMethod()` | `PATCH /payment-methods/:id/set-default` | ✅ | |
| **Direcciones de envío: listar** | `shippingAddressService → getMyAddresses()` | `GET /shipping-address` | ✅ | |
| **Direcciones: crear** | `shippingAddressService → createAddress()` | `POST /shipping-address` | ✅ | |
| **Direcciones: editar** | `shippingAddressService → updateAddress()` | `PUT /shipping-address/:addressId` | ✅ | |
| **Direcciones: eliminar** | `shippingAddressService → deleteAddress()` | `DELETE /shipping-address/:addressId` | ✅ | |
| **Direcciones: set default** | `shippingAddressService → setDefaultAddress()` | `PATCH /shipping-address/:addressId/default` | ✅ | |
| **Crear orden** | `orderService → createOrder()` | `POST /orders` | ✅ | |
| **Carrito: add to cart** | `cartService → addToCart()` | `POST /cart/add-product` | ✅ | |
| **Carrito: update item** | `cartService → updateCartItem()` | `PUT /cart/update-item` | ✅ | |
| **Carrito: remove item** | `cartService → removeToCart()` | `DELETE /cart/remove-item/:productId` | ✅ | |
| **Carrito: clear** | `cartService → clearCart()` | `POST /cart/clear` | ✅ | |
| **Admin: Gestión de productos** | `AdminProducts.jsx` | `GET/POST/PUT/DELETE /products` | ✅ | Panel admin funcional |

---

### 1.2 Solo en Frontend (sin conexión BE real)

| Funcionalidad | Archivo FE | Descripción del Problema |
|---|---|---|
| **Historial de órdenes (`/orders`)** | `Orders.jsx` | Lee **exclusivamente** de `localStorage` vía `STORAGE_KEYS.orders`. No llama ningún endpoint. |
| **Checkout/Pagar (`PurchaseOrder.jsx`)** | `PurchaseOrder.jsx` | Usa **listas de direcciones y tarjetas hardcodeadas** en el componente. Sin conexión al backend. |
| **Preferencias de cuenta** | `Settings.jsx` (tab "Preferencias") | UI decorativa marcada como "próxima actualización". Sin funcionalidad. |
| **Notificaciones (FE)** | Ningún servicio FE | El backend tiene rutas completas para notificaciones; el frontend no tiene ningún servicio ni UI. |

---

### 1.3 Solo en Backend (sin uso desde FE)

| Funcionalidad BE | Ruta | Descripción |
|---|---|---|
| **Órdenes por usuario** | `GET /orders/user/:userId` | El FE llama `orders/my-orders` (que no existe) |
| **Mi carrito** | `GET /cart/my-cart` | El FE llama `cart/user/:userId` (endpoint diferente) |
| **Órdenes (admin): todas** | `GET /orders` | Sin UI admin para órdenes |
| **Órdenes (admin): cancelar** | `PATCH /orders/:id/cancel` | Sin UI admin |
| **Órdenes (admin): status** | `PATCH /orders/:id/status` | Sin UI admin |
| **Órdenes (admin): payment-status** | `PATCH /orders/:id/payment-status` | Sin UI admin |
| **Órdenes (admin): editar completa** | `PUT /orders/:id` | Sin UI admin |
| **Órdenes (admin): eliminar** | `DELETE /orders/:id` | Sin UI admin |
| **Notificaciones: CRUD completo** | `GET/POST/PATCH/DELETE /notifications/*` | 8 endpoints sin ningún consumidor FE |
| **Wishlist: move-to-cart** | `POST /wishList/move-to-cart` | Sin consumidor FE |
| **Wishlist: clear** | `DELETE /wishList/clear` | Sin consumidor FE |
| **Wishlist: check producto** | `GET /wishList/check/:productId` | `checkInWishlist()` existe en `wishlistService.js` pero no se usa en `WishlistContext.jsx` |
| **Carrito (admin): todos los carritos** | `GET /cart` | Sin UI admin |
| **Carrito: crear** | `POST /cart` | No consumido por FE |
| **Carrito: actualizar completo** | `PUT /cart/:id` | No consumido por FE |
| **Carrito: eliminar** | `DELETE /cart/:id` | No consumido por FE |
| **Reviews standalone** | `POST /review`, `GET /review/product/:id`, `PUT /review/:id`, `DELETE /review/:id`, `GET /my-reviews` | Rutas duplicadas en `/reviewRoutes.js` y `/productRoutes.js`. FE solo consume `products/:id/reviews` |
| **Usuarios (admin): buscar** | `GET /users/search` | Sin UI admin para búsqueda |
| **Usuarios (admin): toggle-status** | `PATCH /users/:userId/toggle-status` | Sin UI admin |
| **Usuarios (admin): desactivar propia cuenta** | `PATCH /users/deactivate` | Sin UI |
| **Categorías (admin): CRUD** | `POST/PUT/DELETE /categories` | Sin panel admin de categorías |
| **Método de pago default** | `GET /payment-methods/default` | No consumido por FE |
| **Órdenes FE: getOrderById** | `orderService → getOrderById()` | El servicio existe, no se usa en ninguna página |

---

### 1.4 Parcialmente Implementadas

| Funcionalidad | Estado | Evidencia |
|---|---|---|
| **Carrito híbrido** | ⚠️ Parcial | Funciona con BE cuando hay sesión. Fallback localStorage activo **siempre** (línea 33 CartContext). Si usuario no autenticado, el carrito es solo local sin migración al BE al loguearse. |
| **Historial de órdenes real** | ⚠️ Roto | `orderService.getMyOrders()` llama `orders/my-orders` (inexistente en BE). BE tiene `GET /orders/user/:userId` y requiere `userId` en la URL. |
| **Reviews standalone** | ⚠️ Duplicado | `reviewRoutes.js` define `POST /review` y `productRoutes.js` define `POST /products/:id/reviews`. Ambos llaman al mismo controlador `addProductReview`. Duplicación de rutas. |
| **Checkout real** | ⚠️ Roto | `Checkout.jsx` delega a `CheckoutOrganism` (componente). `PurchaseOrder.jsx` tiene datos hardcodeados. La integración real existe en `orderService.createOrder()` pero no se conecta desde el checkout real. |
| **Admin de usuarios** | ⚠️ Parcial | `userService.getAllUsers/getUserById/updateUser` existen pero sin panel de admin de usuarios en FE. Solo existe `AdminProducts`. |

---

## 2. INVENTARIO DE USO DE localStorage

| Clave localStorage | Dónde se usa | Propósito | ¿Debería migrarse? |
|---|---|---|---|
| `authToken` | `auth.js`, `AuthContext.jsx`, `userService.js` | Token JWT de acceso | **No** — estándar para SPAs |
| `refreshToken` | `auth.js`, `AuthContext.jsx` | Token de refresco | **No** — estándar |
| `userData` | `AuthContext.jsx` | Cache local del perfil del usuario | ⚠️ **Parcialmente** — se usa como fallback multi-tab, pero debería ser secundario al BE |
| `cart` | `CartContext.jsx` (línea 33) | Mirror del carrito en cliente | ⚠️ **Sí** — actualmente siempre escribe en localStorage aunque el BE sea fuente de verdad. Si usuario no autenticado, no se migra al loguearse. |
| `orders` (STORAGE_KEYS.orders) | `Orders.jsx` | Historial de pedidos | 🚨 **Crítico** — reemplazar completamente con `GET /orders/user/:userId` |

> **STORAGE_KEYS** definido en `ecommerce-app/src/utils/storageHelpers.js`.

---

## 3. HALLAZGOS CRÍTICOS

### 🚨 C1 — Historial de órdenes completamente desconectado del backend
- **Archivo:** `Orders.jsx`
- **Evidencia:** `readLocalJSON(STORAGE_KEYS.orders)` — lectura exclusiva de localStorage
- **Impacto:** Usuario pierde historial al limpiar el navegador, cambiar de dispositivo, o usar sesión en incógnito.
- **Fix:** Reemplazar por llamada a `GET /orders/user/:userId` (o crear `GET /orders/me` en BE)

### 🚨 C2 — Endpoint `orders/my-orders` no existe en el backend
- **Archivo:** `orderService.js` línea 12
- **Evidencia:** `http.get("orders/my-orders")` — BE solo expone `GET /orders/user/:userId`
- **Impacto:** Cualquier llamada a `getMyOrders()` retorna error 404
- **Fix:** Añadir `GET /orders/me` en BE **O** actualizar FE para usar `/orders/user/:userId`

### 🚨 C3 — Checkout usa datos hardcodeados (sin conexión real al BE)
- **Archivo:** `PurchaseOrder.jsx`
- **Evidencia:** Arrays `addressList` y `paymentMethodList` hardcodeados en componente (líneas 7-46)
- **Impacto:** El flujo real de compra no consume las API de shipping-address ni payment-methods
- **Fix:** Refactorizar `PurchaseOrder.jsx` para consumir `shippingAddressService` y `paymentMethodService`

### 🚨 C4 — Servicios fantasma leen de JSON estáticos en lugar del API
- **Archivos:** `paymentService.js`, `shippingService.js`
- **Evidencia:** Importan desde `../data/paymentMethods.json` y `../data/shipping-address.json`
- **Impacto:** Cualquier componente que use estos servicios (en vez de los servicios `*MethodService`) trabaja con datos mockeados
- **Fix:** Eliminar `paymentService.js` y `shippingService.js`. Migrar consumo a `paymentMethodService.js` y `shippingAddressService.js`

### ⚠️ C5 — Carrito no migra datos al autenticarse
- **Archivo:** `CartContext.jsx`
- **Evidencia:** `initializeCart()` solo carga carrito del BE al autenticarse, pero no merges items previos en localStorage
- **Impacto:** Items añadidos antes de login se pierden al autenticarse
- **Fix:** Al `initializeCart()`, comparar carrito local con BE y hacer merge/sync

### ⚠️ C6 — Rutas de reseñas duplicadas
- **Archivos:** `reviewRoutes.js` vs `productRoutes.js`
- **Evidencia:** `POST /review` y `POST /products/:id/reviews` ambos llaman `addProductReview`
- **Impacto:** Superficie de API mayor, inconsistencia de contratos
- **Fix:** Consolidar en un solo patrón. Preferir `products/:id/reviews`. Deprecar `/review`

### ⚠️ C7 — Módulo de notificaciones 100% backend sin ningún frontend
- **Rutas BE:** 8 endpoints completos en `notificationRoutes.js` y `notificationController.js`
- **FE:** Cero consumidores — ni servicio, ni contexto, ni UI
- **Fix:** Implementar `notificationService.js` + componente de campana/badge en navegación

### ⚠️ C8 — Panel admin incompleto (solo productos)
- **Disponible FE:** `AdminProducts.jsx`
- **Faltante:** UI para gestión de órdenes, categorías, usuarios
- **Fix:** Crear páginas admin: `AdminOrders.jsx`, `AdminCategories.jsx`, `AdminUsers.jsx`

---

## 4. BACKLOG PRIORIZADO

### 🔴 Prioridad ALTA (bloqueos de negocio)

| ID | Título | Criterio de Aceptación |
|---|---|---|
| **BL-01** | Conectar historial de órdenes al backend | `Orders.jsx` lee de `GET /orders/user/:userId`. Órdenes persisten entre dispositivos. |
| **BL-02** | Crear endpoint `GET /orders/me` en backend | Devuelve órdenes del usuario autenticado sin requerir ID en URL. Alias seguro. |
| **BL-03** | Refactorizar `PurchaseOrder.jsx` para consumir APIs reales | Shipping address y payment method se cargan del BE. `createOrder()` se llama al confirmar. |
| **BL-04** | Eliminar `paymentService.js` y `shippingService.js` | Eliminar archivos. Todos los consumers migrados a servicios reales. |
| **BL-05** | Implementar merge de carrito al autenticarse | Al login, fusionar carrito local con carrito del BE. Carrito no se pierde. |
| **BL-06** | Corregir `orderService.getMyOrders()` - endpoint incorrecto | Llamar el endpoint correcto. No más errores 404 en este servicio. |

### 🟡 Prioridad MEDIA (deuda técnica importante)

| ID | Título | Criterio de Aceptación |
|---|---|---|
| **BL-07** | Implementar módulo de notificaciones en FE | `notificationService.js` + badge en navbar + página de notificaciones. |
| **BL-08** | Consolidar rutas de reseñas (eliminar `/review` standalone) | Un único patrón `products/:id/reviews`. Rutas en `reviewRoutes.js` deprecadas y eliminadas. |
| **BL-09** | Panel admin: Gestión de órdenes | `AdminOrders.jsx` con listar, cambiar status, cancelar órdenes. |
| **BL-10** | Panel admin: Gestión de categorías | `AdminCategories.jsx` con CRUD completo. |
| **BL-11** | Panel admin: Gestión de usuarios | `AdminUsers.jsx` con listar, toggle-status, editar. |
| **BL-12** | Implementar "Mover a carrito" desde wishlist | Consumir `POST /wishList/move-to-cart` en `WishList.jsx`. |
| **BL-13** | Implementar "Limpiar wishlist" | Consumir `DELETE /wishList/clear` en `WishList.jsx`. |
| **BL-14** | Implementar deactivate de cuenta propia | UI Settings → pestaña Seguridad → "Desactivar cuenta". Consume `PATCH /users/deactivate`. |

### 🟢 Prioridad BAJA (mejoras y polish)

| ID | Título | Criterio de Aceptación |
|---|---|---|
| **BL-15** | Implementar preferencias de usuario reales | Backend schema para `preferences: { theme, emailNotifications }`. FE guarda en BE. |
| **BL-16** | `getOrderById` en FE — conectar al detalle de orden | Usar `orderService.getOrderById()` en `OrderConfirmation.jsx` para refetch tras navegación directa. |
| **BL-17** | Remover archivos JSON de datos mock del repositorio | Limpiar `src/data/paymentMethods.json`, `src/data/shipping-address.json`. Mantener solo `categories.json` y `homeImages.json` mientras no haya endpoint en BE. |
| **BL-18** | Eliminar `console.log` de producción | Auditar y remover todos los `console.log` de depuración en controladores y servicios. |

---

## 5. REFACTORS IDENTIFICADOS

| ID | Archivo(s) | Refactor Necesario | Prioridad |
|---|---|---|---|
| **RF-01** | `Orders.jsx` | Reemplazar lógica localStorage por llamadas a API | Alta |
| **RF-02** | `PurchaseOrder.jsx` | Reescritura completa con datos reales del BE | Alta |
| **RF-03** | `paymentService.js`, `shippingService.js` | Eliminar ambos archivos | Alta |
| **RF-04** | `CartContext.jsx` | Agregar lógica de merge al autenticarse (líneas 36-51) | Alta |
| **RF-05** | `reviewRoutes.js` | Eliminar rutas `/review` duplicadas, consolidar en `productRoutes.js` | Media |
| **RF-06** | `orderService.js` | Corregir URL de `getMyOrders()` de `orders/my-orders` a endpoint real | Alta |
| **RF-07** | `cartService.js` | `getCart()` llama `cart/user/${userId}` pero BE expone `GET /cart/my-cart` (autenticado, sin userId). Actualizar. | Alta |
| **RF-08** | `AuthContext.jsx` | `userData` en localStorage es cache de respaldo. Documentar si debe ser eliminado post-sesión. | Baja |
| **RF-09** | `src/data/` | Mover archivos JSON mock a `archive_deprecated_mocks/` o eliminar | Media |

---

## 6. ENDPOINTS QUE REQUIEREN DOCUMENTACIÓN SWAGGER

Los siguientes endpoints están implementados en BE pero carecen de documentación OpenAPI/Swagger:

### Módulo Auth
- `POST /auth/register` — body schema, validaciones, response 201 vs 400
- `POST /auth/login` — response con `token` y `refreshToken`, schema
- `POST /auth/refresh` — body `{ refreshToken }`, response tokens
- `GET /auth/check-email?email=` — response `{ taken: boolean }`
- `POST /auth/logout` — requiere Authorization header

### Módulo Usuarios
- `GET /users/profile` — response `{ user: {...} }`
- `PUT /users/profile` — body schema, campos opcionales
- `PUT /users/change-password` — body `{ currentPassword, newPassword, confirmPassword }`
- `POST /users/profile/upload` — multipart/form-data, campo `avatar`
- `GET /users` — paginación + filtros role/isActive (admin)
- `GET /users/search` — query params
- `PUT /users/:userId` — admin update
- `PATCH /users/:userId/toggle-status` — admin
- `PATCH /users/deactivate` — auto-desactivación

### Módulo Productos
- `GET /products` — paginación, response schema
- `GET /products/search` — todos los filtros documentados (category, minPrice, maxPrice, inStock, sort, order)
- `POST /products` — body schema completo (todos los campos requeridos)
- `PUT /products/:id` — campos opcionales
- `POST /products/upload` — multipart/form-data
- `GET /products/:id/reviews` — response array de reviews
- `POST /products/:id/reviews` — body `{ rating, comment }`

### Módulo Carrito
- `GET /cart/my-cart` — response schema `{ cart: { products: [...] } }`
- `POST /cart/add-product` — body `{ productId, quantity }`
- `PUT /cart/update-item` — body `{ productId, quantity }`
- `DELETE /cart/remove-item/:productId`
- `POST /cart/clear`

### Módulo Órdenes
- `POST /orders` — body schema completo con `products[]`, `shippingAddress`, `paymentMethod`, `shippingCost`
- `GET /orders/user/:userId` — response, paginación
- `GET /orders/:id`
- `PATCH /orders/:id/cancel` (admin)
- `PATCH /orders/:id/status` — enum de estados válidos
- `PATCH /orders/:id/payment-status` — enum de estados válidos

### Módulo Notificaciones (pendiente FE)
- `GET /notifications/user/:userId`
- `GET /notifications/unread/:userId`
- `PATCH /notifications/:id/mark-read`
- `PATCH /notifications/user/:userId/mark-all-read`
- `POST /notifications` (admin)

### Módulo Wishlist
- `GET /wishList` — response `{ wishList: { products: [{product: {...}}] } }`
- `POST /wishList/add` — body `{ productId }`
- `DELETE /wishList/remove/:productId`
- `GET /wishList/check/:productId` — response `{ inWishList: boolean }`
- `POST /wishList/move-to-cart`
- `DELETE /wishList/clear`

### Módulo Métodos de Pago
- `GET /payment-methods/me` — response array vs objeto wrapper
- `POST /payment-methods` — body schema por tipo (credit, debit, paypal, bank)
- `PATCH /payment-methods/:id/set-default`
- `PATCH /payment-methods/:id/deactivate`

### Módulo Direcciones de Envío
- `POST /shipping-address` — body schema completo
- `GET /shipping-address/default` — response cuando no hay default
- `PATCH /shipping-address/:addressId/default`

### Módulo Categorías
- `GET /categories` — response (array plano vs paginado)
- `GET /categories/search` — params `q`, `parentCategory`, `sort`, `order`, paginación
- `POST /categories` (admin) — body schema
- `PUT /categories/:id` (admin)

---

## 7. SPECS FUNCIONALES POR MÓDULO

### SPEC-01: Módulo de Autenticación
**Estado:** ✅ Implementado y funcional  
**FE:** `auth.js`, `AuthContext.jsx`, `Register.jsx`, `Login.jsx`, `GuestOnly.jsx`  
**BE:** `authRoutes.js`, `authController.js`, rate limiting aplicado  
**Pendiente:**
- [ ] El backend valida `roleValidation()` en registro pero el FE no envía el campo `role` — verificar si se asigna default en controller.
- [ ] Manejo de error específico por tipo (email ya existe, contraseña incorrecta) — actualmente FE muestra mensaje genérico.

### SPEC-02: Módulo de Catálogo de Productos
**Estado:** ✅ Implementado y funcional  
**FE:** `productService.js`, `Home.jsx`, `CategoryPage.jsx`, `SearchResults.jsx`  
**BE:** `productRoutes.js`, `productController.js`  
**Pendiente:**
- [ ] `SearchResults.jsx` es un stub de 6 líneas — sin contenido real.
- [ ] `Product.jsx` y `ProductDetails.jsx` son stubs — delegan a organisms no inspeccionados.

### SPEC-03: Módulo de Carrito
**Estado:** ⚠️ Parcialmente integrado  
**FE:** `CartContext.jsx`, `cartService.js`, `Cart.jsx`  
**BE:** `cartRoutes.js`, `cartController.js`  
**Referencias cruzadas incorrectas:**
- FE `getCart(userId)` → `cart/user/${userId}` ❌ (BE tiene `GET /cart/my-cart`)
- FE siempre persiste en localStorage, incluso con BE activo (no es fuente única de verdad)
- Sin merge al autenticarse: items pre-login se pierden

### SPEC-04: Módulo de Órdenes
**Estado:** 🚨 Crítico — FE desconectado  
**FE:** `orderService.js`, `Orders.jsx`, `OrderConfirmation.jsx`, `PurchaseOrder.jsx`  
**BE:** `orderRoutes.js`, `orderController.js`  
**Problemas:**
- `Orders.jsx` → solo localStorage
- `orderService.getMyOrders()` → endpoint 404
- `PurchaseOrder.jsx` → datos hardcodeados, sin submit real al BE

### SPEC-05: Módulo de Wishlist
**Estado:** ✅ Mayormente integrado  
**FE:** `wishlistService.js`, `WishlistContext.jsx`, `WishList.jsx`  
**BE:** `wishListRoutes.js`, `wishListController.js`  
**Pendiente:**
- [ ] "Mover a carrito" no implementado en FE
- [ ] "Limpiar wishlist" no implementado en FE

### SPEC-06: Módulo de Perfil/Configuración
**Estado:** ✅ Implementado y funcional  
**FE:** `Settings.jsx`, `Profile.jsx`  
**BE:** `userRoutes.js`, `userController.js`  
**Pendiente:**
- [ ] Pestaña "Preferencias" — UI decorativa sin backend

### SPEC-07: Módulo de Notificaciones
**Estado:** 🚨 Backend completo, frontend inexistente  
**FE:** Sin ningún archivo  
**BE:** `notificationRoutes.js`, `notificationController.js` — 8 endpoints  

### SPEC-08: Panel Administrativo
**Estado:** ⚠️ Solo productos  
**FE:** `AdminProducts.jsx`  
**BE:** rutas admin en users, orders, categories, notifications  
**Pendiente:**
- [ ] Admin de órdenes
- [ ] Admin de categorías  
- [ ] Admin de usuarios

---

*Documento generado automáticamente mediante auditoría de código. Actualizar con cada sprint.*
