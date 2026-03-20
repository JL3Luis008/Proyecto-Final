# Retro-Bits.com — Proyecto Final

## 🎯 Objetivo
Ecommerce de consolas y videojuegos retro y clásicos. Proyecto de aprendizaje fullstack con Node.js/Express y React.

---

## 🏗️ Stack Tecnológico Real

### Backend (`ecommerce-api/`)
| Aspecto | Tecnología |
|---------|-----------|
| Lenguaje | JavaScript (ES Modules) |
| Runtime | Node.js v20+ |
| Framework | **Express 5.x** |
| Base de datos | **MongoDB** + **Mongoose 8.x** |
| Autenticación | **JWT** (access token 1h + refresh token 7d) |
| Validadores | **express-validator** |
| Testing | **Vitest 4.x** + coverage |

### Frontend (`ecommerce-app/`)
| Aspecto | Tecnología |
|---------|-----------|
| Lenguaje | JavaScript (JSX) |
| Librería UI | **React 19.x** |
| Ruteo | **React Router DOM 7.x** |
| Estado Global | React Context API (`AuthContext`, `CartContext`, `ThemeContext`) + `useReducer` |
| HTTP Client | **Axios** (Instancia propia con interceptores en `http.js`) |

---

## 📂 Estructura del Proyecto

```text
Proyecto-Final/
├── README.md              # Este archivo
├── E2E_PLAN.md            # Plan de Testing Cypress
├── ecommerce-api/         # Servidor Backend (puerto 4000)
│   ├── .env.example       # Copia este a .env
│   ├── AGENTS.md          # <- Documentación técnica de desarrollo Backend
│   └── src/               # Models, Controllers, Routes, Middlewares
└── ecommerce-app/         # Cliente Frontend (CRA, puerto 3000)
    ├── .env.example       # Copia este a .env
    ├── AGENTS.md          # <- Documentación técnica de desarrollo Frontend
    └── src/               # Componentes, Contextos, Servicios
```

---

## 🚀 Cómo Ejecutar

### Prerequisitos
- **Node.js** v20+
- **MongoDB** corriendo localmente o URI de Atlas

### Configuración de Variables de Entorno (.env)

**ecommerce-api/.env:**
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/retrobits
JWT_SECRET=tu-secreto-seguro
REFRESH_TOKEN_SECRET=tu-otro-secreto
CORS_ORIGIN=http://localhost:3000
```

**ecommerce-app/.env:**
```env
REACT_APP_API_BASE_URL=http://localhost:4000/api
```

### Iniciar Backend
```bash
cd ecommerce-api
npm install
npm run dev          # nodemon — http://localhost:4000
```

### Iniciar Frontend
```bash
cd ecommerce-app
npm install
npm start            # Inicia servidor dev de React — http://localhost:3000
```

---

## 🔗 Documentación Relacionada
Todos los detalles técnicos sobre qué parámetros requiere cada función, qué valida cada middleware o cómo se componen los Contextos globales de UI deben ser consultados en los archivos de especificación:
- [Especificaciones Backend](./ecommerce-api/AGENTS.md)
- [Especificaciones Frontend](./ecommerce-app/AGENTS.md)

*(Para historial de desarrollo, revisar plan consolidado `specs_and_backlog.md` en el tracker local del proyecto).*

---

**📅 Actualizado:** Marzo 2026 (Refactor de Arquitectura).  
**👨‍💻 Autor:** Jose Luis Lozano  
**🏫 Proyecto:** Ecommerce Retro-Bits 2025
