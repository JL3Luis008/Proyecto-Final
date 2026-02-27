# AGENTS.testing.md - Guía de Testing (ecommerce-api)

Este documento define los estándares y patrones para realizar pruebas unitarias en `ecommerce-api` utilizando **Vitest**.

## ⚙️ Configuración y Vitest
Aunque `vitest.config.js` permite globales, **DEBES** importar explícitamente las funciones de Vitest para mejorar la claridad y el soporte del IDE.

```javascript
import { beforeEach, describe, expect, it, vi } from "vitest";
```

## 🛠️ Helper `createMockReqRes`
Usa este patrón en el `beforeEach` de tus archivos de prueba para inicializar los objetos `req`, `res` y `next`.

```javascript
let req, res, next;

beforeEach(() => {
  req = {
    body: {},
    query: {},
    params: {},
    user: {} // Si hay autenticación previa
  };
  res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  next = vi.fn();
});
```

## 🧪 Mocking de Modelos Mongoose
Para mockear modelos de Mongoose (que son clases/constructores), usa `vi.hoisted` para definir las funciones mockeadas y luego `vi.mock`.

### Ejemplo (Mocks Hoisted):
```javascript
const { mockModelFindOne, mockModelSave, MockModel } = vi.hoisted(() => {
  const mockModelFindOne = vi.fn();
  const mockModelSave = vi.fn();
  const MockModel = function (data) {
    Object.assign(this, data);
    this.save = mockModelSave;
  };
  return { mockModelFindOne, mockModelSave, MockModel };
});

vi.mock("../../models/myModel.js", () => ({
  default: Object.assign(MockModel, {
    findOne: mockModelFindOne,
    find: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    // otros métodos encadenables...
  }),
}));
```

## 📝 Ejemplo de Test (Auth)

### Registro (Exttracto)
```javascript
it("should register user successfully", async () => {
  req.body = { email: "new@test.com", password: "password123" };
  mockUserFindOne.mockResolvedValue(null); // No existe
  mockUserSave.mockResolvedValue();

  await register(req, res, next);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ email: "new@test.com" }));
});
```

### Login (Exttracto)
```javascript
it("should login user successfully", async () => {
  req.body = { email: "test@test.com", password: "123" };
  mockUserFindOne.mockResolvedValue({ email: "test@test.com", hashPassword: "hashed" });
  mockBcryptCompare.mockResolvedValue(true);
  mockJwtSign.mockReturnValue("token_valido");

  await login(req, res, next);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ token: "token_valido", refreshToken: "token_valido" });
});
```

## ✅ Checklist de Casos Obligatorios
Para cada endpoint, asegúrate de probar:
- [ ] **Éxito**: Devuelve el código de estado correcto (200, 201) y el cuerpo esperado.
- [ ] **Error de Cliente (400/404)**: Manejo de datos inválidos, duplicados o recursos no encontrados.
- [ ] **Error de Servidor (500)**: Simula un fallo de BD (`mockRejectedValue`) y verifica que se llame a `next(error)`.
- [ ] **Lógica de Autenticación**: Si el endpoint es protegido, verifica que use los datos de `req.user`.
- [ ] **Efectos Secundarios**: Verifica que se llame a `save()` o `findOne()` con los argumentos correctos.
