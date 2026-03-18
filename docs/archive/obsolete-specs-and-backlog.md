# 0. Auditoría de documentación existente

## 0.1 Inventario de documentos revisados
1. `README.md` (Raíz)
2. `IMPROVEMENTS.md` (Raíz)
3. `E2E_PLAN.md` (Raíz)
4. `ecommerce-api/AGENTS.md`
5. `ecommerce-app/AGENTS.md`
6. `docs/specs/2026-03-12-bugfix-cart-sync-fix.md`
7. `docs/NodejsBestPractices.md`, `docs/React.md`, `docs/SSDLC.md`, etc. (Carpeta `docs/` genérica).

## 0.2 Documentación vigente y aprovechable
- **`ecommerce-api/AGENTS.md` y `ecommerce-app/AGENTS.md`:** Excelentes fuentes de verdad que detallan la arquitectura arquitectónica técnica *real* (hooks, contexts, middlewares, models).
- **`docs/specs/2026-03-12-bugfix-cart-sync-fix.md`:** Refleja con precisión la implementación reciente de la sincronización del carrito.
- **`E2E_PLAN.md`:** Válido como iniciativa de testing en curso para Cypress.

## 0.3 Documentación desactualizada pero recuperable
- **`README.md`:** Recuperable. Incluye versiones de stack erróneas o herramientas no utilizadas en la actualidad, y no advierte de los pasos necesarios exactos para evitar choques de puertos. 
- **`IMPROVEMENTS.md`:** Contiene valiosos puntos de deuda técnica (como el error fatal del parámetro `next`), sin embargo, documenta bugs **que ya fueron resueltos en el código** (Ej: *3. App.jsx - Ruta /settings duplicada*, y *7. CategoryService simula llamadas*). Actualmente `categoryService.js` ya consulta el endpoint real de la API.

## 0.4 Documentación obsoleta o contradictoria
- Los apartados de `IMPROVEMENTS.md` apuntando a refactors locales que el código ya superó (rutas duplicadas y fetching simulado en el Frontend). 

## 0.5 Documentación duplicada o redundante
- **Carpeta `docs/` (Root):** Los archivos como `NodejsBestPractices.md`, `GitWorkflow.md`, `React.md` son recetarios genéricos generados por Inteligencia Artificial y no aportan información funcional sobre *Retro-Bits*. Generan un alto volumen de "ruido" documental al escanear el repositorio.

## 0.6 Recomendación por documento
- `ecommerce-*/AGENTS.md`: **Conservar** (como fuente técnica principal).
- `docs/specs/2026-...-fix.md`: **Consolidar** (dentro del tracking principal de desarrollo, luego archivar).
- `E2E_PLAN.md`: **Actualizar** (y agrupar en una carpeta `/tests`).
- `README.md`: **Actualizar** (ajustar dependencias y puertos reales de ejecución).
- `IMPROVEMENTS.md`: **Consolidar** (Mover contenido útil al Backlog y eliminar el Markdown).
- `docs/*.md` (Best practices genéricos): **Archivar/Eliminar** (moverse a un repo general de recursos del developer, fuera de Retro-Bits).

## 0.7 Riesgos de mantener documentación incorrecta
- **Pérdida de tiempo en Onboarding:** Los desarrolladores rastrearán bugs fantasmas referenciados en `IMPROVEMENTS.md` pero inexistentes en el código.
- **Vulnerabilidad por desincronización:** Documentar flujos de localStorage en un lugar, pero ya haber migrado la API en otro.

## 0.8 Propuesta de estructura documental limpia
```text
Proyecto-Final/
├── README.md               # Overview ágil e instrucciones concretas de setup
├── architecture.md         # Fusión de los AGENTS.md en un solo doc o carpeta docs/
├── features/               # Specs de negocio por módulo funcional
│   ├── auth.md
│   ├── cart-checkout.md
│   └── catalog.md
├── backlog.md              # Reemplazo vivo de IMPROVEMENTS.md
└── tests_e2e.md            # Reemplazo de E2E_PLAN
```

---

# 1. Diagnóstico del proyecto actual

## 1.1 Resumen ejecutivo
Retro-Bits.com es un proyecto e-commerce MERN en fase de desarrollo tardío. El desarrollo "Happy Path" del core business está mayormente ensamblado (Catálogo, Auth, Carrito). Sin embargo, carece fuertemente de consistencia en el checkout, tiene páginas placeholder (Wishlist, Settings), y arrastra una deuda técnica en la capa de controladores del backend que pone en riesgo de "Crash" al entorno de producción por manejo de excepciones deficiente.

## 1.2 Estado del backend
- **Implementado y confirmado:** Configuración Node/Express v5, mongoose models (User, Product, Order, Cart, Category), validadores de requests (`express-validator`), middlewares robustos (Rate Limiting y JWT Authentication).
- **Parcialmente implementado:** Faltan índices explícitos en MongoDB para queries eficientes y paginación real en endpoints masivos.
- **Riesgos:** Patrón de diseño inconsistente; los controladores combinan acceso a BD y lógica de negocio. Múltiples controladores omiten la declaración obligatoria del parámetro `next`, provocando un `ReferenceError` letal ante el primer fallo asíncrono.

## 1.3 Estado del frontend
- **Implementado y confirmado:** Contextos globales (CartContext, AuthContext, ThemeContext), Hook personalizado de parseo de UI (`useFormReducer`), ruteo protegido con React Router 7.
- **Parcialmente implementado:** Flujo de Checkout (funciona local).
- **Inconsistente / Faltante:** `WishList.jsx` y `Settings.jsx` están totalmente vacíos. Falta mostrar la información completa del `ProductDetails.jsx`. 

## 1.4 Estado de persistencia de datos
- **DB Real:** Autenticación de Usuarios (`/api/auth`), Productos (`/api/products`), Categorías, y sincronización de Carrito (`cartService.js`).
- **localStorage:** 1) Respaldo visual del carrito (sincronizado con API en segundo plano). 2) **Direcciones de Envío y Pagos en el Checkout** (`STORAGE_KEYS.addresses` y `STORAGE_KEYS.payments`).
- **Gaps / Inconsistencias:** El usuario tiene modelos `ShippingAddress` y `PaymentMethod` en backend, y rutas asociadas (`shippingAddressRoutes.js`), per el **Checkout del frontend usa persistencia en localStorage**. El cruce de estos flujos (crear orden en localStorage y mandarla a Backend vs persistir previamente la dirección del usuario en backend) es el choque arquitectónico más crítico actualmente.

## 1.5 Flujos funcionales detectados
1. **Flujo Guest:** Explora categorías/productos -> Agrega carrito (requiere Login).
2. **Flujo Auth:** Registro/Login -> Generación JWT en LocalStorage.
3. **Flujo CartSync:** Carrito UI -> `useCart()` -> Acción hacia local state -> Llama API silenciosamente -> Repopula state en caso de auth.
4. **Flujo Checkout (Incompleto):** Guarda dirección usuario local -> Guarda método pago local -> Combina datos y genera "Order" temporal en LocalStorage. 

## 1.6 Riesgos técnicos y funcionales
- **Crash de Servidor:** Funciones asíncronas en `productController` y otros, sin firma `(req, res, next)` haciendo llamados a `next(error)`.
- **Falsa Seguridad/Pérdida de Operaciones:** El sistema de direcciones del usuario en Checkout sobreescribiéndose localmente; si entra de otro dispositivo, perderá sus datos de pago y ubicación.
- **Refresh Token Inseguro:** El logout en Frontend limpia Tokens de localStorage, pero en backend el Refresh Token vive sus 7 días de validez sin bloqueos (Falta Blocklist de tokens en Redis o BD para invalidarlo).

## 1.7 Supuestos e hipótesis pendientes de validar
- **Hipótesis:** Se supone que el flujo `checkout` en el frontend (`App.jsx`, `Checkout/Address/`) todavía está prototipado y su integración con el backend (`orderRoutes`) está pendiente.
- **Hipótesis:** El backend asume que las vistas de "Detalle Producto" mostrarían "Reseñas" y "Rating" por modelo, pero el Front actualmente no incluye componentes de UI que recolecten o muestren esas reseñas.

---

# 2. Spec del proyecto

## 2.1 Descripción general del sistema
Retro-Bits.com es una plataforma e-commerce Single-Page Application (SPA) para consolas y videojuegos clásicos, con persistencia centralizada en base de datos NoSQL, autenticación basada en JWT, y carrito de recálculo dinámico.

## 2.2 Objetivo del producto
Permitir a los coleccionistas y gamers descubrir, agrupar en carritos y comprar bienes retro digitalizando la experiencia de compra en una interfaz rápida e intuitiva. 

## 2.3 Problema que resuelve
Proporciona un portal especializado para productos retro clásico, diferenciándose por la gestión categorizada (sistemas parent-child), búsquedas text-matching de Mongo, y persistencia total entre dispositivos.

## 2.4 Alcance actual
- Navegación asimétrica por categorías de frontend.
- Búsqueda textual por API.
- Carrito de compras sincronizado entre localStorage y la Nube.
- Alta, baja y autenticación de usuarios.

## 2.5 Alcance objetivo
- Vistas reales y completas de Wishlist.
- Proceso de checkout validando stock pre-confirmación.
- Manejo de direcciones y tarjetas directas contra la Nube (API de persistencia).
- Backoffice mínimo para administradores (Role Auth en Vistas y Endpoints).

## 2.6 Módulos del sistema

### Módulo: Auth & Users
- **Propósito:** Gestión de identidades, registro y control de acceso JWT.
- **Estado Actual:** Completado.
- **Endpoints:** `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/users/profile`.
- **Modelos:** `User`.
- **Gaps:** Implementación técnica del DenyList de JWT en logout para cerrar sesión fuerte. Puntos de error (`next()`) no capturados en el controlador de user.

### Módulo: Catalog (Products y Categories)
- **Propósito:** Descubrimiento de artículos de compra, jerarquías de categoría, indexado.
- **Estado Actual:** Parcial (Falta detalle avanzado en Front).
- **Endpoints:** `/api/products/search`, `/api/products/category/:idCategory`.
- **Modelos:** `Product`, `Category`.
- **Gaps:** Excepción inmanejada en catch (res.status(500) a veces, next(error) sin declarar next en controller). Faltan índices `text` en el modelo y paginación forzada. Interfaz vacía en `ProductDetails` de UI.

### Módulo: Cart & Compras
- **Propósito:** Concentrar intencion de compra, aplicar costos.
- **Estado Actual:** Mix (Cart BD sincrónico finalizado. Direcciones local. Pago local).
- **Endpoints:** `/api/cart/*`, `/api/orders/*`.
- **Modelos:** `Cart`, `Order`, `PaymentMethod`, `ShippingAddress`.
- **Gaps:** Traslado urgente de responsabilidades. Checkout debe mutar Address hacia el Endpoint de ShippingAddress, y no al localStorageHelper.

## 2.7 Arquitectura funcional actual
Frontend envía peticiones autenticadas vía Bearer token desde contexto `AuthContext`. El carrito replica eventos globalmente a suscriptores visuales. Checkout captura la transacción y prepara un blob offline de orden.

## 2.8 Arquitectura técnica actual
- **Frontend:** React 19 (Hooks Context + useReducer). Axios + Interceptores para refresco automático de tokens (`http.js`).
- **Backend:** Express Router -> Validation Middleware (`express-validator`) -> Role Middleware -> Controller -> Mongoose.
- **Manejo de errores:** Captura centralizada en Wrapper Customizado (Mongoose Error Parsing hacia standard HTTP status errors). *Roto si explota en Controlador sin parámetro `next`*.
- **Persistencia Local vs Remota:** JWT se mantiene en localStorage (vulnerable a XSS). El Frontend depende demasiado de persistencias efímeras (`STORAGE_KEYS.addresses`).

## 2.9 Inconsistencias detectadas
1. **Checkout LocalStorage vs DB:** Checkout procesa `address` y `payment` en localStorage (`writeLocalJSON`) en lugar de usar los endpoints nativos implementados en `/api/shippingAddressRoutes.js`.
2. **Manejo de Respuestas de Error Backend:** Se utilizan validaciónes asíncronas de base de datos directas en controladores en lugar de inyectar servicios segregados, y falla el signature standard del middleware errorHandler limitando el monitoreo global.

## 2.10, 2.11 Reglas del Sistema (Funcionales / Técnicas)
- Todo calculo monetario de envío ocurre server-side, validando montos (>=$1000 MXN Envío Gratis, o $350 tarifa) al crear el objeto `Order` (Actualmente delegado a FrontEnd por omisión).
- Solo peticiones desde DOMinios admitidos de Origen (`process.env.CORS_ORIGIN`).

## 2.12 Deuda técnica identificada
*Falsa asincronía y fallos runtime*: Rutinas Mongoose atrapadas en bloques Catch cuya variable target "next" jamás fue instanciada en el router padre (provocará cuelgues del proceso principal v8).
*Servicios Mongoose fusionados*: Se deben crear capas `src/services/productService.js` en backend para separar la consulta de la entrega del Response HTTP.

## 2.14 Recomendaciones de normalización y cierre de gaps
1. **Parchar Bugs Runtime Inmediatos (`next`)**: Añadir `next` a las firmas de los controllers en Backend como prioridad P0.
2. **Normalizar Checkout**: Migrar los Steps form components de `Checkout/Address/` para que usen peticiones axios GET y POST a `shippingAddressService` y `paymentMethodService` en el Frontend. Eliminar utilidades localStorage para datos del negocio.
3. **Página de Productos Detallados / Rutas Ciegas**: Asignar wireframes o placeholders a endpoints vacios como `Wishlist`, integrando `wishListController` del backend al Frontend.

## 2.15 Propuesta de documentación final
1. **README.md:** Config ágil del dev server 4000/3000.
2. **Backend Architecture & Routes / Frontend Components & Contexts:** (`architecture.md` unificada de los AGENTS).
3. **Dev Backlog:** Archivo Kanban-like de features restando.

---

# 3. Backlog estructurado

## 3.1 Épicas
1. **EPI-1:** Estabilidad del Servidor y API.
2. **EPI-2:** Completitud y Sincronización del Flujo Transaccional.
3. **EPI-3:** Cobertura UI de Experiencia del Usuario (Settings & Catalog).
4. **EPI-4:** Seguridad e Higiene.

## 3.2 y 3.3 Features y Tareas Priorizadas

| Prioridad | Épica | Tipo | Descripción | Tareas Técnicas Asociadas |
|---|---|---|---|---|
| **Crítico** | EPI-1 | Bug | Crash en Controladores Backend por variable `next` indeterminada. | 1. Modificar signatures de todos los controladores asíncronos en Express (`(req, res, next)`). |
| **Crítico** | EPI-2 | Alineación | Formularios de Checkout apuntando a LocalStorage en lugar de API. | 1. Modificar `Checkout/AddressForm.jsx` para invocar API. 2. Modificar `Checkout/PaymentForm.jsx`. 3. Modificar utilería `storageHelpers.js` para retirar addresses/payments. |
| **Alto** | EPI-3 | Feature | Implementación componentes UI faltantes y vistas estériles. | 1. Desarrollar `WishList.jsx` trayendo `api/wishlist`. 2. Implementar View Component `ProductDetails.jsx`. 3. Maquetar y enlazar API de usuario a la vista `Settings.jsx`. |
| **Medio** | EPI-4 | Seguridad | Vulnerabilidad al Logout de vida util en tokens. | 1. Implementar Blocklist de JWT Tokens en DB/Redis para endpoint `/api/auth/logout`. |
| **Medio** | EPI-1 | Deuda Técnica | Controladores gordos y lógica mezclada. | 1. Refactor de `productController` a `productService`. 2. Sustituir validaciones hardcode con middlewares `express-validator`. |
| **Medio** | EPI-1 | Refactor | Falta de Índices BD para Performance. | 1. En capa `models/product.js` y `models/user.js`, insertar schemas index elements (`text`, `category']). |

---

# 4. Historias de usuario

**ID:** US-001  
**Título:** Sincronización de Checkout (Dirección y Metodo de Pago)  
**Como** comprador registrado (Customer),  
**Quiero** guardar mi dirección y tarjeta de crédito en los servidores de la tienda durante el checkout,  
**Para** no tener que reingresarlos al iniciar sesión en otros navegadores o dispositivos.  
**Criterios de aceptación:**  
- El formulario de dirección en React Router (`/checkout`) debe recuperar sus listados a través del endpoint GET `/api/shippingAddress`.  
- Finalizar el checkout de la nueva dirección hace un POST a nuestra base de datos, encriptado JWT.  
- Las direcciones antiguas guardadas en base de datos aparecen disponibles por defecto en DropDown.  
**Definición de terminado:**  
- El código en React ha sido probado en red, demostrando redibujar estados del Store local sin llamadas a localStorage para ese dato sensible.  
**Dependencias técnicas:** Interceptores Axios listos y Modelos Mongoose actualizados.  
**Prioridad:** Crítico.  
**Estado actual relacionado:** Inconsistente (actualmente se guarda en LocalStorage contraintuitivamente).  

<br>

**ID:** US-002  
**Título:** Lista de Deseos Funcional (Wishlist UI)  
**Como** explorador de catálogo (Guest/Customer),  
**Quiero** visualizar una lista real dedicada donde apunto juegos del catálogo a la plataforma.  
**Para** recordarlos posteriormente, checar sus precios, y pasarlos directo al carrito.  
**Criterios de aceptación:**  
- Acceder a `/wishlist` debe renderizar productos.  
- Tarjeta de producto en `/product/:id` y Home posee un componente `HeartIcon` botón interactivo.  
- Interactuar con el corazón emite Payload al Endpoint.  
**Definición de terminado:**  
- Frontend renderizando los items en matriz Flexbox respondiendo y consumiendo `userService/wishListService`.  
**Prioridad:** Alto.  
**Estado actual relacionado:** No implementado (Stub).

<br>

**ID:** US-003  
**Título:** Estabilización de Try/Catch en Controladores (Bugfix Crítico)  
**Como** sistema en entorno de producción,  
**Quiero** que todos los controladores asíncronos reciban la variable `next` en su firma,  
**Para** poder delegar correctamente cualquier excepción de base de datos al manejador global de errores sin causar un crash.  
**Criterios de aceptación:**  
- Revisar todos los métodos en `productController.js` y demás modulos que usen la sintaxis `async function (req, res)`.  
- Modificarlos a `async function (req, res, next)`.  
- Validar mediante test que un error forzado no tire el proceso Node.  
**Definición de terminado:**  
- El 100% de los controllers asíncronos declaran `next`.  
**Prioridad:** Crítico.  
**Estado actual relacionado:** Parcialmente implementado y roto (ReferenceError en runtime).

<br>

**ID:** US-004  
**Título:** Implementación de Página de Ajustes de Usuario (Settings UI)  
**Como** cliente registrado,  
**Quiero** tener un panel funcional de "Ajustes",  
**Para** cambiar mi información de contacto principal, contraseña y nombre de visualización.  
**Criterios de aceptación:**  
- Construir interfaz en `Settings.jsx` utilizando `useFormReducer`.  
- Conectar componentes a métodos PUT de `userService` (`/users/profile`, `/users/change-password`).  
**Definición de terminado:**  
- El usuario puede editar su info y contraseña usando los endpoints ya existentes sin recargar la página.  
**Prioridad:** Medio.  
**Estado actual relacionado:** No implementado (Stub).

<br>

**ID:** US-005  
**Título:** Revocación Segura de Token (Blocklist/Denylist)  
**Como** administrador de seguridad,  
**Quiero** que la acción de Logout en la plataforma revoque la validez del JWT Token de ese usuario del lado del servidor,  
**Para** prevenir que un token interceptado pueda usarse maliciosamente a pesar de que el usuario legítimo cerró su sesión.  
**Criterios de aceptación:**  
- Implementar Blocklist en memoria, BD o Redis (según infraestructura elegida).  
- Proveer un endpoint POST `/api/auth/logout` que añada el token a la lista.  
- Añadir verificación al `authMiddleware.js` para rechazar tokens incluidos en la Blocklist.  
**Definición de terminado:**  
- Llamar a endpoints protegidos con un Token revocado arroja `401 Unauthorized`.  
**Prioridad:** Medio / Alto.  
**Estado actual relacionado:** Incompleto (Solo se destruye localmente en React).

---

# 5. Plan de limpieza documental

Para garantizar que el equipo no cometa errores persiguiendo directivas obsoletas, la limpieza recomendada se ejecuta en el siguiente orden estricto:

## 5.1 Documentos a conservar
- `ecommerce-api/AGENTS.md` y `ecommerce-app/AGENTS.md` (Contienen el patrón exacto, API exacta y uso del CustomHook `useFormReducer`).

## 5.2 Documentos a actualizar
- **`README.md`**: Remover menciones de Redux/Helmet y adaptar las variables de entorno reales extraídas del modelo (`CORS_ORIGIN`, JWT, PORT localhosts verdaderos).
- **`E2E_PLAN.md`**: Actualizar la nota al pie sugiriendo los módulos verdaderos de login para interceptarlos via Cypress con fixtures.

## 5.3 Documentos a fusionar o consolidar
- **`IMPROVEMENTS.md`**: Extraer únicamente las menciones *Válidas y Críticas* (Falla parámetro `next`, Indices faltantes mongoose, Bloqueo de Token Logout) e insertarlos como **TICKETS o ISSUES** en un sistema real (o el nuevo documento de Backlog de Github/Markdown). **ELIMINAR** todas las entradas respecto a Categorías, Settings rutas repetidas y fallas viejas del Front. Todo el tracking se maneja ahora a través del **Spec y Backlog Integrado** que generamos en este reporte.

## 5.4 Documentos a archivar
- **`docs/specs/2026-03-12-bugfix-cart-sync-fix.md`**: Ya está terminado y documentó que el Cart está sincronizado. Puede trasladarse a una carpeta de histórica `/archive-specs` o elminarse bajo criterio purista de control de versiones git history.

## 5.5 Documentos a eliminar
- La carpeta RAÍZ `/docs` con archivos masivos genéricos recetados por IA: `React.md`, `NodejsBestPractices.md`, `APIBestPractices.md`, `SSDLC.md`, `MongoDBPatterns.md`, `TestingStrategies.md`. Estos archivos no otorgan valor operacional particularizado sobre *RetroBits.com* y ahogan las búsquedas del developer y el contexto algorítmico, incrementando de manera excesiva la información analizada y arriesgando la asunción de supuestas arquitecturas inoperantes (Ej. que el proyecto utiliza Worker Threads, o Cache `NodeCache` como dictan docenas de las guías genéricas insertadas).

## 5.6 Orden recomendado para hacer la limpieza
1. Cargar el "Backlog Crítico y Alto" extraído en Fase 3 y meterlo en tu Tracker Tool (o guardarlo).
2. Borrar archivo `IMPROVEMENTS.md`.
3. Borrar la carpeta y archivos genéricos `docs/React.md`, `TestingStrategies.md`, etc.
4. Reescribir el Front/Intro del `README.md` basado en el Diagnostic Final.

## 5.7 Riesgos de no hacer esta limpieza
Si no se retiran las "Best Practices.md" genéricas y el "IMPROVEMENTS.md" obsoleto, el equipo o agentes artificiales que entren a reparar continuarán leyendo reportes pasados sobre partes que ya han mutado sustancialmente (como la sincronización del Carrito recién añadida), entrando en un bucle contradictorio. Además causará carga cognitiva inmanejable sobre las definiciones y reglas exclusivas del proyecto (mezclando sugerencias hipotéticas de Redis para Caché con las reglas directas de JWT del ecommerce API).
