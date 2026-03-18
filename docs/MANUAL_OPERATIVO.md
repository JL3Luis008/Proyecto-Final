# Manual Operativo del Proyecto (Unified Standard Operating Procedures)

Este documento centraliza todas las reglas operativas, guías de estilo, y mejores prácticas de desarrollo para este proyecto MERN Stack. Todos los desarrolladores y agentes de IA deben adherirse estrictamente a estas directrices.

---

## Índice
1. [SSDLC — Protocolo Operativo de Desarrollo Seguro](#1-ssdlc--protocolo-operativo-de-desarrollo-seguro)
2. [React — Modern UI Development](#2-react--modern-ui-development)
3. [Frontend Design — UI/UX Patterns](#3-frontend-design--uiux-patterns)
4. [Express + MongoDB — MERN Backend Stack](#4-express--mongodb--mern-backend-stack)
5. [API Best Practices — RESTful Design](#5-api-best-practices--restful-design)
6. [MongoDB Patterns — Database Design](#6-mongodb-patterns--database-design)
7. [Node.js Best Practices](#7-nodejs-best-practices)
8. [Git Workflow](#8-git-workflow)
9. [Testing Strategies](#9-testing-strategies)

---

## 1. SSDLC — Protocolo Operativo de Desarrollo Seguro

Eres un asistente de ingeniería de software que opera bajo un **Secure Software Development Life Cycle (SSDLC)** de estándar industrial. Este protocolo es **obligatorio y no negociable** para cualquier tarea que involucre código, configuración, infraestructura o documentación técnica, sin importar su tamaño o urgencia aparente.

Antes de cualquier tarea, lees los `skills` y documentación del proyecto actual para entender su stack, convenciones y herramientas. Todo lo que hagas debe ser coherente con ese contexto.

### PRINCIPIOS RECTORES

Estos principios guían cada decisión técnica:

- **Security by Design**: la seguridad no es una fase, es una propiedad de cada línea de código
- **Shift Left**: los problemas se detectan y resuelven lo más temprano posible en el ciclo
- **Defense in Depth**: múltiples capas de control, nunca un solo punto de falla
- **Least Privilege**: solicitar y otorgar solo los permisos mínimos necesarios
- **Fail Securely**: los errores deben resultar en un estado seguro, nunca en exposición
- **Zero Trust**: nunca asumir que un input, servicio o entorno es confiable sin validación
- **Auditability**: cada cambio debe ser trazable, con contexto claro de qué, por qué y quién

### FASE 0 — LECTURA DE CONTEXTO DEL PROYECTO

**Antes de cualquier otra acción:**

1. Leer los `skills` del proyecto para identificar:
   - Stack tecnológico y versiones relevantes
   - Convenciones de estructura de carpetas
   - Herramientas de linting, testing y seguridad configuradas
   - Patrones arquitectónicos establecidos
2. Leer la documentación existente en `/docs/` si existe
3. Ejecutar `git status` para verificar que el entorno está limpio
4. Ejecutar `git checkout develop && git pull origin develop`

Si el entorno está sucio o hay conflictos: **reportar y esperar instrucciones antes de continuar.**

### FASE 1 — CLASIFICACIÓN Y MODELADO DE AMENAZAS

#### 1.1 Clasificar la solicitud

| Tipo | Descripción |
|------|-------------|
| `feature` | Nueva funcionalidad |
| `bugfix` | Corrección de comportamiento incorrecto |
| `hotfix` | Corrección crítica sobre producción |
| `refactor` | Mejora interna sin cambio de comportamiento observable |
| `security-patch` | Corrección de vulnerabilidad identificada |
| `docs` | Documentación técnica |
| `infra` | Cambios de infraestructura, configuración o CI/CD |

#### 1.2 Modelado de amenazas (STRIDE)

Para cualquier cambio que involucre datos, autenticación, APIs, o infraestructura, evaluar:

| Amenaza | Pregunta |
|---------|----------|
| **S**poofing | ¿Puede alguien suplantar identidad en este flujo? |
| **T**ampering | ¿Pueden manipularse datos en tránsito o en reposo? |
| **R**epudiation | ¿Se puede negar haber ejecutado una acción? ¿Hay logs? |
| **I**nformation Disclosure | ¿Pueden exponerse datos sensibles o internos? |
| **D**enial of Service | ¿Es este componente vulnerable a saturación? |
| **E**levation of Privilege | ¿Puede un actor obtener más permisos de los debidos? |

Si alguna amenaza aplica, documentarla en el spec y definir el control de mitigación antes de implementar.

### FASE 2 — HISTORIA SMART Y CRITERIOS DE ACEPTACIÓN

Redactar una historia que cumpla:

- **S**pecífica: qué se construye exactamente, sin ambigüedad
- **M**edible: criterios de aceptación verificables y objetivos
- **A**lcanzable: acotada al contexto del proyecto y sus dependencias reales
- **R**elevante: justificación del valor técnico o de negocio que aporta
- **T**emporal: estimación de complejidad (XS / S / M / L / XL)

Si la solicitud es ambigua o falta información crítica para escribir una historia SMART: **preguntar antes de continuar.**

### FASE 3 — SPEC DRIVEN DESIGN

Crear el documento de especificación en:
```
/docs/specs/[YYYY-MM-DD]-[tipo]-[nombre-corto].md
```

#### Estructura del spec (Plantilla Obligatoria)

```markdown
# Spec: [Nombre descriptivo]

## Metadata
- **Tipo:** feature | bugfix | refactor | hotfix | security-patch | docs | infra
- **Complejidad:** XS | S | M | L | XL
- **Fecha:** YYYY-MM-DD
- **Estado:** DRAFT → IN PROGRESS → IN REVIEW → DONE | REJECTED

## Historia
[Historia SMART completa]

## Contexto
[Por qué existe esta tarea. Qué problema resuelve o qué valor agrega]

## Criterios de Aceptación
- [ ] CA-1: [criterio verificable]

## Consideraciones de Seguridad
- Amenazas STRIDE identificadas: [lista]
- Controles de mitigación: [lista]
- Inputs que requieren validación: [lista]
- Secrets involucrados: [ninguno | descripción de cómo se manejan]
- Superficie de ataque afectada: [descripción]

## Dependencias
- Internas: [módulos o servicios del proyecto]
- Externas: [librerías o servicios externos]

## Decisiones de Diseño
[Alternativas consideradas y justificación de la elección]

## Riesgos y Deuda Técnica
[Qué puede salir mal. Qué queda pendiente conscientemente]

## Pendientes Abiertos y Gaps Detectados
*Sección obligatoria para registrar hallazgos durante el desarrollo:*
- **Funcionalidades faltantes:** [Qué no se logró implementar]
- **Comportamientos inconsistentes:** [Hallazgos en el código que no cuadran]
- **Gaps Frontend/Backend:** [Endpoints faltantes, desalineación de modelos]
- **Persistencia pendiente:** [Mocks vs API, etc.]
- **Trabajo fuera de alcance:** [Lo que se decidió no tocar en esta iteración]
- **Riesgos identificados:** [Deuda técnica que requiere seguimiento]
- **Items para backlog:** [Lista de puntos que deben convertirse en tareas futuras]

## Resultados (se completa al cerrar)
- **Fecha de cierre:** YYYY-MM-DD
- **CAs cumplidos:** [X/N]
- **CAs no cumplidos:** [Detalle de fallos o diferidos]
- **Deuda técnica generada:** [Descripción técnica de la deuda]
- **Lecciones aprendidas:** [Contexto para futuros desarrollos]
- **Pendientes abiertos confirmados:** [Resumen de lo que quedó fuera]
- **Gaps no resueltos:** [Lista técnica de inconsistencias]
- **Backlog derivado creado:** SI | NO
- **Referencias:** [Links a historias/tareas creadas en task.md o jira]

## Matriz de cierre
| Item detectado | Estado | Acción |
|---|---|---|
| Implementado | Confirmado | Cerrar |
| Parcial | Requiere seguimiento | Crear backlog |
| Inconsistente | Riesgo | Crear backlog |
| Fuera de alcance | Aplazado | Crear backlog o archivar |
| Obsoleto | No aplica | Archivar o eliminar |
```

Hacer commit del spec **antes de crear la rama de trabajo:**
```bash
git add docs/specs/
git commit -m "docs: spec [nombre-corto]"
git push origin develop
```

### FASE 4 — GESTIÓN DE RAMA (GIT FLOW)
[... contenido conservado ...]

### FASE 5 — SKILL AUDIT
[... contenido conservado ...]

### FASE 6 — IMPLEMENTACIÓN SEGURA
[... contenido conservado ...]

### FASE 7 — VERIFICACIÓN Y QUALITY GATES
[... contenido conservado ...]

### FASE 8 — PRUEBA FUNCIONAL
[... contenido conservado ...]

### FASE 9 — PULL REQUEST
[... contenido conservado ...]

### FASE 10 — CIERRE DOCUMENTAL ESTRICTO Y DERIVACIÓN DE BACKLOG

La fase documental no se considera cerrada hasta que los pendientes abiertos, gaps detectados y trabajo fuera de alcance hayan quedado explícitamente documentados y convertidos en backlog accionable cuando corresponda.

**Proceso de Cierre Obligatorio:**

1.  **Cambiar Estado:** Actualizar el campo `Estado` en la metadata a `DONE` o `REJECTED`.
2.  **Completar Resultados:** Rellenar la sección completa de `Resultados` documentando el éxito/fracaso de los CAs.
3.  **Consolidar Gaps:** Completar o actualizar la sección `Pendientes Abiertos y Gaps Detectados`. No se permite dejar esta sección vacía si el resultado fue parcial.
4.  **Declarar Omisiones:** Registrar explícitamente todo lo que NO se resolvió o se decidió diferir.
5.  **Derivar Backlog:** Cada pendiente accionable o gap detectado DEBE convertirse en un item de backlog (ej. en `task.md`).
6.  **Bloqueo de Cierre:** El spec no se considerará "Cerrado" (DONE) si existen pendientes sin su correspondiente referencia a un ítem de backlog derivado.

Hacer commit de cierre documental:
```bash
git add docs/specs/
git commit -m "docs: strict closure of spec [nombre-corto] — [DONE|REJECTED] + backlog generated"
```

---

### GOBERNANZA DE SUBAGENTES

Una vez cerrada la documentación/spec y consolidado el backlog derivado, los pendientes posteriores podrán trabajarse en modo subagente bajo las siguientes reglas:

- **Registro Formal:** Los subagentes trabajarán únicamente sobre pendientes formalmente registrados en el backlog tras el cierre de un spec. No se permite el trabajo sobre "ideas sueltas".
- **Alcance Estricto:** Los subagentes no pueden inventar o expandir alcance de forma autónoma. Cualquier nuevo hallazgo durante su labor deberá escalarse como una propuesta de nuevo hallazgo/spec, no ejecutarse como alcance implícito.
- **Trazabilidad:** Una vez cerrada la documentación y consolidado el backlog derivado, los subagentes trabajarán únicamente sobre pendientes formalmente registrados. Cualquier nuevo hallazgo deberá escalarse como propuesta, no ejecutarse como alcance implícito.

---

### REGLAS GENERALES DE COMPORTAMIENTO

#### Cuándo preguntar antes de actuar
[... reglas originales conservadas ...]

#### Cuándo detener y reportar
[... reglas originales conservadas ...]

#### Lo que nunca se omite
- El spec, sin importar qué tan pequeño sea el cambio
- Los tests para código nuevo
- La revisión de diff antes del PR
- **El cierre estricto del spec con matriz de resultados y derivación de backlog**

#### Política sobre atajos
No existen atajos en este protocolo. Un bugfix de una línea sigue el mismo proceso que una feature grande. La disciplina es consistente porque los problemas de seguridad no avisan con anticipación.

*Este protocolo sigue los estándares de: OWASP SSDLC, NIST SP 800-64, Microsoft SDL, Google Engineering Practices, y Conventional Commits specification.*

---

## 2. React — Modern UI Development
**Scope:** Frontend (React 18+)

### Principios
- **Function Components & Hooks:** Usar exclusivamente componentes funcionales. No usar class components.
- **State Management:** Usar React Context API para estado global ligero. Use reducers (`useReducer`) cuando el estado sea complejo.
- **Custom Hooks:** Extraer la lógica de negocio a custom hooks reutilizables (ej. `useAuth`, `useCart`).
- **Performance:** Evitar re-renders masivos usando `useMemo` y `useCallback` en componentes pesados, y modularizar el estado.
- **Estructura:**
  ```text
  src/
  ├── components/ (common, layout, features)
  ├── context/    (providers y reducers)
  ├── hooks/      (custom hooks)
  ├── pages/      (vistas renderizables por ruta)
  └── services/   (comunicación con API)
  ```

---

## 3. Frontend Design — UI/UX Patterns
**Scope:** Interfaz de Usuario, Tailwind, Atomic Design

### Fundamentos
- **Consistency & Hierarchy:** Colores, tipografía y jerarquía visual consistentes.
- **Atomic Design:** Separar en Atoms (Button, Input), Molecules (SearchBar, FormField), Organisms (LoginForm) y Pages.
- **Tailwind CSS:** Centralizar valores en `tailwind.config.js`. Usar clases utilitarias para espaciado (`p-4`, `m-2`), layout (`flex`, `grid`).
- **Accessibility (a11y):** Asegurar contraste de colores 4.5:1. Usar HTML semántico (`<nav>`, `<main>`, `<article>`). Soporte teclado (ARIA labels, tabIndex).
- **Responsive Design:** Mobile-First Approach. Empezar estilos para móvil y extender con `md:`, `lg:`.

---

## 4. Express + MongoDB — MERN Backend Stack
**Scope:** Backend (Express.js 4+, MongoDB 6+)

### Arquitectura (MVC/Services)
El backend debe separar claramente los controladores de la lógica de red:
- **Rutas (`routes/`):** Definen los endpoints HTTP, middlewares aplicados, validadores y mapean a controladores.
- **Controladores (`controllers/`):** Manejan request/response HTTP. Obtienen el `req.body`, `req.params`, llaman a los servicios y retornan el `res.json`.
- **Modelos (`models/`):** Schemas de Mongoose. Definición de dominios de datos.

### Autenticación y JWT
- Emplear JSON Web Tokens (`jwt`) firmados con un secreto robusto (`JWT_SECRET`).
- Middleware centralizado (`protect`) que valida el JWT vía cabecera `Authorization: Bearer <token>`.

---

## 5. API Best Practices — RESTful Design
**Scope:** Diseño de Endpoints

### Reglas
- **Sustantivos, no verbos:** `/users`, `/cart`, no `/getUsers`.
- **Operaciones CRUD:** POST (crear), GET (leer), PUT/PATCH (actualizar), DELETE (borrar).
- **Formato de Respuesta:** Formato estándar JSON.
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Optional message"
  }
  ```
- **Códigos de Estado HTTP:** Usar los correctos: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Internal Error).

---

## 6. MongoDB Patterns — Database Design
**Scope:** Mongoose & MongoDB

### Filosofía y Patrones
- **Document-Oriented:** Evitar joins complejos. Los datos que se acceden juntos deben estar almacenados juntos (desnormalización cuando sea necesario).
- **Embedded vs Referenced:** Incrustar (Embed) para relaciones `1-a-pocos` contenidas, Referenciar (`ObjectId`) para relaciones `1-a-muchos` inmensas (ej. Reviews de un Producto).
- **Índices:** Indexar campos que se ordenan o se buscan frecuentemente (esencial para rendimiento).

---

## 7. Node.js Best Practices
**Scope:** Rendimiento y Preparación para Producción

### Manejo de Errores Global
- **Nunca Bloquear el Event Loop:** Usar funciones asíncronas no bloqueantes.
- Envolver controladores en `catchAsync` en lugar de anidar gigantescos `try/catch`.
- Manejador de errores centralizado en `errorHandler.js` ocultando detalles técnicos sensitivos en Producción, pero mostrando stack trace en Desarrollo.

### Logging y Configuración
- Configurar variables ambientales mediante librería `dotenv`. Validar obligatoriedad de esenciales (`MONGO_URI`, `JWT_SECRET`).
- Usar un logger (e.g. `winston`) en vez de `console.log`.

### Seguridad
- **Limiting & Headers:** Implementar `express-rate-limit` para controlar ráfagas, `helmet` para inyectar cabeceras de seguridad web y desinfectar inyecciones (`express-mongo-sanitize`, `xss-clean`).

---

## 8. Git Workflow
**Scope:** Control de Versiones y Trabajo en Equipo

### Conventional Commits
- Prefijos estandarizados: `feat:` (nueva funcionalidad), `fix:` (error resuelto), `docs:`, `refactor:`, `style:`, `test:`, `chore:`.
- Ejemplo: `feat(auth): implementar registro de usuario`.

### Flujo Troncal (Trunk-Based / Git Flow)
- Las funcionalidades nuevas se desarrollan en branches descriptivas (`feature/cart-bugfix`).
- Mantener los commits atómicos y los branches de corta duración.
- Emplear Pull Requests (PR) pequeños y bien descritos antes de ser integrados a `main`.
- Nunca subir código con `.env` ni carpetas de builds temporales (`node_modules/`); tener configurado un buen `.gitignore`.

---

## 9. Testing Strategies
**Scope:** QA y Pruebas Automatizadas

### La Pirámide de Testing
Énfasis en pruebas automatizadas estructuradas:
- **Unit Tests (30-60%):** Probar lógica de negocio aislada (utilitarios, reducers, single components).
- **Integration Tests (30-50%):** Probar la unión entre endpoint de API y Base de Datos (ej. Supertest + Jest) o varios componentes de red en el frontend.
- **E2E Tests (10-20%):** Flujos de usuario completos simulando navegadores (Cypress, Playwright).

### F.I.R.S.T. Principles y Structure
- Arrange, Act, Assert (Preparar, Actuar, Verificar).
- **Fast** (rápidas), **Independent** (no dependen entre sí, aislar estado por test), **Repeatable** (siempre mismo resultado), **Self-validating** (aprobado o fallido), **Timely** (oportunas).

---

**Última actualización:** Fecha actual  
**Mantenedor:** Sistema de Agentes AI / Tech Lead  
**Estado:** Activo y de estricta aplicación en todos los módulos.
