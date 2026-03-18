# PLAN_APP.md — Plan de Refactorización: ecommerce-app

> Última actualización: 2026-03-03
> Estado: En Progreso

---

## Objetivo

Refactorizar el proyecto React MVP de eCommerce para que cumpla estrictamente con el patrón **Atomic Design**, mantener el modelo visual y de marca ya establecido, y garantizar consistencia en imports, exports y uso del tema CSS.

---

## Cambios Realizados

### ✅ 1. Reestructuración de Carpetas — Atomic Design

Se reorganizó la carpeta `src/components` desde una estructura por feature/vista hacia la estructura canónica de Atomic Design:

**Estructura anterior:**
```
src/
  components/
    common/          ← componentes reutilizables sin clasificación
    App/
    BannerCarousel/
    Cart/
    CategoryProducts/
    Checkout/
    List/
    LoginForm/
    ProductCard/
    ProductDetails/
    ProfileCard/
    RegisterForm/
    SearchResultsList/
```

**Estructura nueva (Atomic Design):**
```
src/
  components/
    atoms/           ← Componentes indivisibles (Badge, Button, Icon, Input, Loading, ErrorMessage)
    molecules/       ← Uniones simples de átomos (ProductCard, ProfileCard)
    organisms/       ← Secciones con lógica y múltiples moléculas (Checkout, BannerCarousel, Header, etc.)
    templates/       ← Layouts base sin datos finales (pendiente de implementar)
```

**Mapeo de componentes:**

| Componente | Nivel Atomic | Justificación |
|---|---|---|
| `Badge` | Atom | Elemento visual único sin lógica |
| `Button` | Atom | UI primitiva, sin lógica de negocio |
| `Icon` | Atom | SVG/ícono puro |
| `Input` | Atom | Campo de formulario base |
| `Loading` | Atom | Spinner sin dependencias |
| `ErrorMessage` | Atom | Texto de error simple |
| `ProductCard` | Molecule | Combina Badge, Button e imagen |
| `ProfileCard` | Molecule | Combina Badge y datos del usuario |
| `App` | Organism | Orquestador de rutas de la app |
| `BannerCarousel` | Organism | Carrusel de banners con estado interno |
| `Cart` | Organism | Vista del carrito con lógica de cantidades |
| `CategoryProducts` | Organism | Lista de productos de una categoría |
| `Checkout` | Organism | Flujo multi-paso de pago (con sub-carpetas) |
| `List` | Organism | Lista genérica reutilizable |
| `LoginForm` | Organism | Formulario de login con validación |
| `ProductDetails` | Organism | Vista detallada de producto |
| `RegisterForm` | Organism | Formulario de registro con validación |
| `SearchResultsList` | Organism | Resultados de búsqueda paginados |

---

## Cambios Pendientes

### 🔲 2. Actualizar Rutas de Imports

Al mover los componentes, todos los imports en `pages/`, `layout/`, `context/` y otros archivos deben actualizarse a la nueva ruta atómica.

**Patrón de cambio requerido:**

```js
// ANTES
import Loading from "../components/common/Loading/Loading";
import Button from "../components/common/Button/Button";
import ProductCard from "../components/ProductCard/ProductCard";

// DESPUÉS
import Loading from "../components/atoms/Loading/Loading";
import Button from "../components/atoms/Button/Button";
import ProductCard from "../components/molecules/ProductCard/ProductCard";
```

**Archivos que requieren actualización de imports:**
- `src/index.js`
- `src/pages/ProtectedRoute.jsx`
- `src/pages/GuestOnly.jsx`
- `src/pages/Home.jsx`
- `src/pages/Product.jsx`
- `src/pages/Cart.jsx`
- `src/pages/Checkout.jsx`
- `src/pages/Login.jsx`
- `src/pages/Register.jsx`
- `src/pages/Profile.jsx`
- `src/pages/Orders.jsx`
- `src/pages/SearchResults.jsx`
- `src/pages/CategoryPage.jsx`
- `src/pages/WishList.jsx`
- `src/layout/Header/Header.jsx`
- `src/layout/Footer/Footer.jsx`
- `src/layout/Navigation/Navigation.jsx`
- `src/components/organisms/Checkout/*.jsx`

---

### 🔲 3. Consistencia en Exports (Barrel Exports)

Cada carpeta de nivel Atomic Design debe tener un `index.js` de barril que re-exporte todos sus componentes, permitiendo imports limpios:

```js
// src/components/atoms/index.js
export { default as Badge } from './Badge/Badge';
export { default as Button } from './Button/Button';
export { default as Icon } from './Icon/Icon';
export { default as Input } from './Input/Input';
export { default as Loading } from './Loading/Loading';
export { default as ErrorMessage } from './ErrorMessage/ErrorMessage';
```

```js
// src/components/molecules/index.js
export { default as ProductCard } from './ProductCard/ProductCard';
export { default as ProfileCard } from './ProfileCard/ProfileCard';
```

```js
// src/components/organisms/index.js
export { default as App } from './App/App';
export { default as BannerCarousel } from './BannerCarousel/BannerCarousel';
export { default as Cart } from './Cart/CartView';
// ... etc
```

Esto permite el siguiente patrón de imports limpio en las páginas:

```js
import { Button, Input, Loading } from '../components/atoms';
import { ProductCard } from '../components/molecules';
```

---

### 🔲 4. Eliminar Estilos Inline — Mover a Clases CSS

Se encontraron **11 instancias** de estilos inline (`style={{...}}`) que deben ser refactorizados a clases CSS en los archivos `.css` de cada componente:

| Archivo | Línea | Estilo inline a migrar |
|---|---|---|
| `pages/Checkout.jsx` | 358 | `{ textAlign: "center", marginTop: 12 }` |
| `components/organisms/ProductCard/ProductCard.jsx` | 15 | `{ padding: "24px", textAlign: "center" }` |
| `components/organisms/ProductCard/ProductCard.jsx` | 47 | `{ color: "inherit", textDecoration: "none" }` |
| `components/organisms/ProductCard/ProductCard.jsx` | 55 | `{ fontSize: "13px", marginBottom: "8px" }` |
| `components/organisms/ProductCard/ProductCard.jsx` | 65 | `{ display: "flex", gap: "8px" }` |
| `components/molecules/ProfileCard/ProfileCard.jsx` | 47 | `{ background: ROLE_COLORS[role] }` |
| `components/organisms/BannerCarousel/BannerCarousel.jsx` | 96 | Inline dinámico de posición/transición |
| `components/organisms/BannerCarousel/BannerCarousel.jsx` | 187 | Inline dinámico de posición/transición |
| `pages/OrderConfirmation.jsx` | 79 | `{ float: "right" }` |
| `pages/ProtectedRoute.jsx` | 20 | `{ textAlign: "center", padding: "48px" }` |
| `pages/ProtectedRoute.jsx` | 76 | `{ textAlign: "center", padding: "48px" }` |

> **Excepción justificada:** `BannerCarousel` usa estilos inline para animaciones dinámicas con valores calculados en JS (posición del slide). Esto se puede convertir en CSS custom properties (`--offset`) para que las animaciones sean manejadas por CSS.

---

### 🔲 5. Reemplazar Colores Hardcodeados en CSS por Variables del Tema

Los siguientes archivos `.css` contienen colores hexadecimales codificados que **rompen el Dark Mode** y la consistencia del tema. Deben reemplazarse por variables CSS del `:root`:

- `pages/Profile.css` — colores: `#333`, `#2196f3`, `#28a745`, `#e9ecef`, etc.
- `pages/Login.css` — colores: `#f5f5f5`, `#2196f3`, `#1976d2`, `#c62828`, etc.
- `pages/Cart.css` — colores: `#e5e5e5`, `#fff`, `#666`, `#333`
- `pages/Orders.css` — colores: `#166534`, `#0369a1`, `#b91c1c`

**Mapa de reemplazo sugerido:**

| Valor hardcodeado | Variable del tema |
|---|---|
| `#333` | `var(--text)` |
| `#555`, `#666` | `var(--muted)` |
| `#fff`, `#ffffff` | `var(--surface)` |
| `#f5f5f5`, `#f8f9fa` | `var(--bg)` |
| `#ddd`, `#dee2e6`, `#eee` | `var(--border)` |
| `#2196f3`, `#1976d2` | `var(--accent)` |
| `#28a745` | `var(--color-green)` |
| `#dc2626`, `#c62828` | `var(--color-red)` |

---

### 🔲 6. Funcionalidades Faltantes (Roadmap)

| Feature | Prioridad | Sección | Estado |
|---|---|---|---|
| Estructura Atomic Design (atoms → organisms) | Alta | Refactorización | ✅ Realizado |
| Mapeo de qué componente va en qué nivel | Alta | Refactorización | ✅ Documentado |
| Patrón de imports rotos que hay que actualizar | Alta | Refactorización | ✅ Realizado (Páginas, App e Imports Internos corregidos) |
| Barrel exports (`index.js`) por nivel | Alta | Refactorización | ✅ Realizado |
| Eliminar estilos inline (11 instancias mapeadas) | Media | Refactorización | 🔲 Pendiente |
| Reemplazar colores hardcodeados por variables CSS | Media | Refactorización | 🔲 Pendiente |
| Rutas protegidas robustas | Alta | Funcionalidad | 🔲 Pendiente |
| Guest Checkout | Media | Funcionalidad | 🔲 Pendiente |
| Reseñas y Calificaciones | Media | Funcionalidad | 🔲 Pendiente |
| Filtros Avanzados | Media | Funcionalidad | 🔲 Pendiente |
| 404 Page | Alta | Funcionalidad | 🔲 Pendiente |
| Cross-Selling | Baja | Funcionalidad | 🔲 Pendiente |

---

## Variables del Tema Definidas

El sistema de diseño ya existe en `src/index.css`. Referencia de variables disponibles:

```css
:root {
  /* Paleta de Marca */
  --color-strong-blue: #055a2b;
  --color-blue: #078f44;
  --color-green: #79bf87;
  --color-yellow: #e7e000;
  --color-red: #dc2626;
  --color-gray: #6b7280;

  /* Tema Semántico */
  --bg, --surface, --text, --muted, --border, --accent, --accent-contrast

  /* Espaciado y Radio */
  --radius, --r1 → --r5, --gap

  /* Sombras */
  --elev-1 → --elev-5
}
```

**Dark Mode:** `:root[data-theme="dark"]` — ya implementado, activado cambiando el atributo `data-theme` en el `<html>`.

---

*Este archivo es un documento vivo. Se deberá actualizar conforme se completen los cambios.*
