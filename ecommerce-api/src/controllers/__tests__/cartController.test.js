import { beforeEach, describe, expect, it, vi } from "vitest";

// --- Mongoose Mocking Helper ---
class MockQuery {
  constructor(data = null) {
    this.data = data;
  }
  populate = vi.fn().mockReturnThis();
  sort = vi.fn().mockReturnThis();
  skip = vi.fn().mockReturnThis();
  limit = vi.fn().mockReturnThis();
  exec = vi.fn().mockResolvedValue(this.data);
  then(onFullfilled, onRejected) {
    return Promise.resolve(this.data).then(onFullfilled, onRejected);
  }
}

const { mockCart } = vi.hoisted(() => {
  const mockCart = vi.fn(function (data) {
    Object.assign(this, data);
    this.save = vi.fn().mockResolvedValue(this);
    this.populate = vi.fn().mockResolvedValue(this);
  });
  mockCart.find = vi.fn();
  mockCart.findOne = vi.fn();
  mockCart.findById = vi.fn();
  mockCart.findByIdAndUpdate = vi.fn();
  mockCart.findByIdAndDelete = vi.fn();
  mockCart.create = vi.fn();
  return { mockCart };
});

vi.mock("../../models/cart.js", () => ({
  default: mockCart,
}));

// Import after mocking
import {
  addProductToCart,
  clearCartItems,
  createCart,
  deleteCart,
  getCartById,
  getCartByUser,
  getCarts,
  removeCartItem,
  updateCart,
  updateCartItem,
} from "../cartController.js";

function makeReqRes(overrides = {}) {
  const req = { 
    query: {}, 
    params: {}, 
    body: {}, 
    user: { userId: "testuser123", role: "customer" }, 
    ...overrides 
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

// Reliable User Mock
const mockUser = { toString: () => "testuser123" };

describe("CartController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCarts", () => {
    it("CA-01 Obtener todos los carritos", async () => {
      const { req, res, next } = makeReqRes();
      const carts = [{ _id: "c1", user: { displayName: "U1" } }];
      mockCart.find.mockReturnValue(new MockQuery(carts));

      await getCarts(req, res, next);
      expect(res.json).toHaveBeenCalledWith(carts);
    });
  });

  describe("getCartById", () => {
    it("CA-02 ID válido", async () => {
      const { req, res, next } = makeReqRes({ params: { id: "c1" } });
      const cart = { _id: "c1", user: { _id: { toString: () => "testuser123" } } };
      mockCart.findById.mockReturnValue(new MockQuery(cart));

      await getCartById(req, res, next);
      expect(res.json).toHaveBeenCalledWith(cart);
    });

    it("CA-10 ID no encontrado → 404", async () => {
      const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
      mockCart.findById.mockReturnValue(new MockQuery(null));
      await getCartById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getCartByUser", () => {
    it("CA-04 Usuario con carrito", async () => {
      const { req, res, next } = makeReqRes();
      const cart = { _id: "c1", user: "testuser123", products: [] };
      mockCart.findOne.mockReturnValue(new MockQuery(cart));

      await getCartByUser(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cart retrieved successfully",
        cart,
      });
    });

    it("CA-05 Usuario sin carrito", async () => {
      const { req, res, next } = makeReqRes();
      mockCart.findOne.mockReturnValue(new MockQuery(null));

      await getCartByUser(req, res, next);
      expect(res.json).toHaveBeenCalledWith({
        message: "No cart found for this user",
        cart: { user: "testuser123", products: [] },
      });
    });
  });

  describe("addProductToCart", () => {
    const productId = "p1";

    it("CA-07 Nuevo carrito para el usuario", async () => {
      const { req, res, next } = makeReqRes({ body: { productId, quantity: 2 } });
      mockCart.findOne.mockResolvedValue(null);

      // constructor mock returns instance with populates
      const saveMock = vi.fn().mockResolvedValue(true);
      const populateMock = vi.fn().mockReturnThis();
      mockCart.mockImplementation(function () {
        this.user = "testuser123";
        this.products = [{ product: productId, quantity: 2 }];
        this.save = saveMock;
        this.populate = populateMock;
      });

      await addProductToCart(req, res, next);
      expect(saveMock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("CA-08 Añadir a carrito existente", async () => {
      const { req, res, next } = makeReqRes({ body: { productId, quantity: 1 } });
      const existingCart = {
        user: mockUser,
        products: [{ product: { toString: () => productId }, quantity: 1 }],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };
      mockCart.findOne.mockResolvedValue(existingCart);

      await addProductToCart(req, res, next);
      expect(existingCart.products[0].quantity).toBe(2);
    });
  });

  describe("updateCartItem", () => {
    it("CA-12 Actualiza cantidad", async () => {
      const { req, res, next } = makeReqRes({ body: { productId: "p1", quantity: 5 } });
      const existingCart = {
        user: mockUser,
        products: [{ product: { toString: () => "p1" }, quantity: 1 }],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };
      mockCart.findOne.mockResolvedValue(existingCart);

      await updateCartItem(req, res, next);
      expect(existingCart.products[0].quantity).toBe(5);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("clearCartItems", () => {
    it("CA-18 Vacía el carrito", async () => {
      const { req, res, next } = makeReqRes();
      const existingCart = {
        user: mockUser,
        products: [{ product: "p1" }],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };
      mockCart.findOne.mockResolvedValue(existingCart);

      await clearCartItems(req, res, next);
      expect(existingCart.products).toHaveLength(0);
    });
  });

  describe("removeCartItem", () => {
    it("CA-20 Elimina producto do carrito → 200", async () => {
      const { req, res, next } = makeReqRes({ params: { productId: "p1" } });
      const existingCart = {
        user: mockUser,
        products: [{ product: { toString: () => "p1" }, quantity: 1 }],
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };
      mockCart.findOne.mockResolvedValue(existingCart);

      await removeCartItem(req, res, next);
      expect(existingCart.products).toHaveLength(0);
    });
  });

  describe("updateCart", () => {
    it("CA-25 Sin campos en body → 400", async () => {
      const { req, res, next } = makeReqRes({ params: { id: "c1" }, body: {} });
      mockCart.findById.mockReturnValue(new MockQuery({ user: mockUser }));

      await updateCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("CA-26 Actualización exitosa → 200", async () => {
      const { req, res, next } = makeReqRes({
        params: { id: "c1" },
        body: { products: [{ product: "p1", quantity: 2 }] },
      });
      const existingCart = {
        user: mockUser,
        save: vi.fn().mockResolvedValue(true),
        populate: vi.fn().mockReturnThis(),
      };
      mockCart.findById.mockReturnValue(new MockQuery(existingCart));

      await updateCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteCart", () => {
    it("CA-28 Eliminación exitosa → 204", async () => {
      const { req, res, next } = makeReqRes({ params: { id: "c1" } });
      mockCart.findById.mockReturnValue(new MockQuery({ user: mockUser }));
      mockCart.findByIdAndDelete.mockResolvedValue({ _id: "c1" });

      await deleteCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it("CA-29 Carrito no encontrado → 404", async () => {
      const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
      mockCart.findById.mockReturnValue(new MockQuery(null));

      await deleteCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("createCart", () => {
    it("CA-30 Crea carrito → 201", async () => {
      const { req, res, next } = makeReqRes({ body: { products: [] } });
      mockCart.findOne.mockResolvedValue(null);
      mockCart.create.mockResolvedValue({
        _id: "c2",
        populate: vi.fn().mockResolvedValue(true),
      });

      await createCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
    });
    
    it("CA-31 Carrito ya existe → 400", async () => {
      const { req, res, next } = makeReqRes({ body: { products: [] } });
      mockCart.findOne.mockResolvedValue({ _id: "c1" });
      await createCart(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
