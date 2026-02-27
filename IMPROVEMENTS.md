# IMPROVEMENTS.md — Retro-Bits.com
> Análisis profundo del código real. Febrero 2026.

---

## 🐛 Bugs Críticos Identificados

### 1. `productController.js` — `next` sin declarar (Runtime Error en producción)
**Afecta:** `getProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`
**Problema:** Estas funciones usan `next(error)` pero están declaradas como `async function f(req, res)` — sin `next` como parámetro. En producción, esto lanza `ReferenceError: next is not defined`.
```js
// ❌ INCORRECTO
async function getProducts(req, res) { ... next(error); }

// ✅ CORRECTO
async function getProducts(req, res, next) { ... next(error); }
```

### 2. `productController.js` — Validación inline en lugar de middlewares
**Problema:** `createProduct` y `updateProduct` validan campos con `if (!name) return res.status(400)...` en el controlador, ignorando el sistema de validators de `middlewares/validators.js`.
**Impacto:** Inconsistencia de mensajes de error, duplicación de lógica, y dificultad para testear.

### 3. `App.jsx` — Ruta `/settings` duplicada
**Líneas 77-91:** La ruta `/settings` está definida dos veces con el mismo componente.

### 4. `WishList.jsx` y `Setttings.jsx` — Páginas vacías
Ambas páginas tienen sólo 39 bytes de contenido (un `export default` vacío). La wishlist necesita implementación.

### 5. `server.js` — CORS hardcodeado
```js
// ❌ INCORRECTO
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
```
El frontend corre en **puerto 3000** pero el README dice 3000. El origen CORS debe venir de `process.env.CORS_ORIGIN`.

---

## 🏗️ Arquitectura

### 6. Falta capa de Servicios en el Backend
Los controladores mezclan lógica de acceso a datos con lógica de negocio. La propuesta es extraer la lógica de BD a archivos `src/services/`:
```
src/services/
  authService.js     # checkUserExist, generateToken, etc.
  productService.js  # queries de Product con filtros
  cartService.js     # operaciones del carrito
```
**Beneficio:** Controladores ligeros, servicios testeables de forma aislada.

### 7. `CategoryService.jsx` del frontend usa datos locales (JSON)
`categoryService.js` simula llamadas con delays y datos locales. Debería conectarse al endpoint real `/api/categories`.

---

## 🛡️ Seguridad

### 8. `strictLimiter` mal documentado
El comentario dice "Máximo 3 intentos por hora" pero el código tiene `max: 100`. Corregir el comentario o el límite.

### 9. No se invalidan los refresh tokens en logout
Actualmente el `logout` sólo borra el token del localStorage. Si se intercepta el token antes de cerrar sesión, sigue siendo válido hasta que expire (7 días). Implementar una blocklist/denylist de tokens en Redis o en la BD.

### 10. Token de acceso en localStorage
**Riesgo:** XSS puede robar el `authToken`. Considerar migrar a **httpOnly cookies** para el token de acceso.

---

## ⚡ Performance

### 11. Sin paginación en CartController `getCarts`
`getCarts` devuelve todos los carritos sin límite ni paginación. En producción con miles de usuarios esto es inviable.

### 12. Falta de índices en Mongoose
Los modelos no definen índices explícitos. Agregar al menos:
```js
// user.js
userSchema.index({ email: 1 }); // ya es unique, pero definirlo explícitamente mejora queries
// product.js
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' }); // búsqueda full-text con $search
```

### 13. `searchProducts` hace `console.log(inStock)` en producción
Línea 135 de `productController.js`. Limpiar logs de debug antes de producción.

---

## 🛠️ Developer Experience (DX)

### 14. `ProductDetails.jsx` y `CategoryPage.jsx` son stubs
Archivos de 250-450 bytes con render mínimo. El catálogo de productos no tiene detail page funcional.

### 15. `.env` no tiene ejemplo documentado
Agregar un `.env.example` en ambos proyectos documenta qué variables son requeridas:
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/retrobits
JWT_SECRET=your-super-secret
REFRESH_TOKEN_SECRET=another-secret
CORS_ORIGIN=http://localhost:4000
NODE_ENV=development
```

### 16. Script para correr ambos proyectos simultáneamente
En la carpeta raíz `Proyecto-Final/`, agregar un `package.json` con:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix ecommerce-api\" \"npm start --prefix ecommerce-app\"",
    "install:all": "npm install --prefix ecommerce-api && npm install --prefix ecommerce-app"
  }
}
```

### 17. README desactualizado
El `README.md` raíz menciona herramientas no utilizadas (Helmet, Morgan como helmet, Redux) y no lista el stack real. Actualizar con la información correcta del analysis.

---

## 🎯 Prioridad Sugerida

| # | Mejora | Prioridad | Esfuerzo |
|---|--------|-----------|---------|
| 1 | Fix `next` faltante en productController | 🔴 Crítico | Bajo |
| 5 | CORS desde `process.env` | 🔴 Crítico | Bajo |
| 2 | Validators en productController | 🟠 Alto | Medio |
| 3 | Ruta duplicada en App.jsx | 🟠 Alto | Bajo |
| 9 | Token blocklist en logout | 🟠 Alto | Alto |
| 6 | Capa de servicios backend | 🟡 Medio | Alto |
| 12 | Índices Mongoose | 🟡 Medio | Bajo |
| 16 | Script de desarrollo raíz | 🟢 Bajo | Bajo |
| 4 / 14 | Implementar páginas vacías | 🟢 Bajo | Alto |
