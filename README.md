# Retro-Bits.com — Proyecto Final

## 🎯 Objetivo
Ecommerce de consolas y videojuegos retro y clásicos. Proyecto de aprendizaje fullstack con Node.js/Express y React.

---

## 🏗️ Stack Tecnológico

### Backend (`ecommerce-api/`)
| Aspecto | Tecnología |
|---------|-----------|
| Lenguaje | JavaScript (ES Modules) |
| Runtime | Node.js v20+ |
| Framework | **Express 5.x** |
| Base de datos | **MongoDB** + **Mongoose 8.x** |
| Autenticación | **JWT** (access token 1h + refresh token 7d) |
| Hashing | **bcrypt** |
| Validación | **express-validator 7.x** |
| Rate Limiting | **express-rate-limit** |
| Testing | **Vitest 4.x** + coverage v8 |
| Linter | ESLint 9 |

### Frontend (`ecommerce-app/`)
| Aspecto | Tecnología |
|---------|-----------|
| Lenguaje | JavaScript (JSX) |
| Librería UI | **React 19.x** |
| Ruteo | **React Router DOM 7.x** |
| Estado Global | React Context API + useReducer |
| HTTP Client | **Axios 1.x** |
| Build Tool | Create React App (react-scripts 5) |
| Testing | React Testing Library |

---

## 📂 Estructura del Proyecto

```
Proyecto-Final/
├── README.md
├── IMPROVEMENTS.md        # sugerencias de mejora basadas en el código
├── ecommerce-api/
│   ├── .env               # PORT, MONGODB_URI, JWT_SECRET, REFRESH_TOKEN_SECRET, CORS_ORIGIN
│   ├── server.js          # entry point — Express + CORS + rutas
│   ├── AGENTS.md          # documentación para agentes/desarrolladores
│   ├── AGENTS.testing.md
│   └── src/
│       ├── config/        # database.js
│       ├── controllers/   # lógica de negocio (auth, cart, product, user, order...)
│       ├── middlewares/   # auth, isAdmin, validators, rateLimiter, errorHandler
│       ├── models/        # esquemas Mongoose (User, Product, Cart, Order...)
│       ├── routes/        # rutas express por recurso
│       └── seed/          # script de datos iniciales
└── ecommerce-app/
    ├── .env               # REACT_APP_API_BASE_URL
    ├── AGENTS.md
    ├── AGENTS.testing.md
    └── src/
        ├── components/    # UI components (App, common, Cart, Checkout, ProductCard...)
        ├── context/       # AuthContext, CartContext, ThemeContext
        ├── hooks/         # useFormReducer
        ├── pages/         # vistas (Home, Cart, Checkout, Orders, Profile...)
        ├── services/      # capa API (http.js + servicios por recurso)
        └── utils/         # storageHelpers.js
```

---

## 🚀 Cómo Ejecutar

### Prerequisitos
- **Node.js** v20+
- **MongoDB** corriendo localmente o URI de Atlas

### Backend
```bash
cd ecommerce-api
npm install
# Configurar .env (ver .env.example)
npm run dev          # nodemon — http://localhost:4000
npm run seedProducts # sembrar datos iniciales
```

### Frontend
```bash
cd ecommerce-app
npm install
# REACT_APP_API_BASE_URL=http://localhost:4000/api en .env
npm start            # http://localhost:3000 (o 3000 según CRA)
```

### Testing (Backend)
```bash
cd ecommerce-api
npm test             # vitest run
npm run test:watch   # modo interactivo
npm run test:coverage
```

---

## 🗂️ Rutas Frontend

| Path | Página | Acceso |
|------|--------|--------|
| `/` | Home | Público |
| `/cart` | Cart | Público |
| `/login` | Login | Solo invitados |
| `/register` | Register | Público |
| `/product/:id` | ProductDetails | Público |
| `/category/:id` | CategoryPage | Público |
| `/search` | SearchResults | Público |
| `/checkout` | Checkout | Requiere auth |
| `/orders` | Orders | Requiere auth |
| `/profile` | Profile | Requiere auth |
| `/wishlist` | WishList | Requiere auth |
| `/settings` | Settings | Requiere auth |
| `/order-confirmation` | OrderConfirmation | Público |

---

## 🔗 Documentación Relacionada
- [API AGENTS.md](./ecommerce-api/AGENTS.md) — rutas, modelos, validators, patrones backend
- [App AGENTS.md](./ecommerce-app/AGENTS.md) — contextos, componentes, hooks, flujo checkout
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) — bugs y mejoras identificadas en el código

---

**📅 Actualizado:** Febrero 2026  
**👨‍💻 Autor:** Jose Luis Lozano  
**🏫 Proyecto:** Ecommerce Retro-Bits 2025
