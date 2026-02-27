import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Helpert de Mocking para Mongoose ──────────────────────────────────────────
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
    // Métodos estáticos
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

// Importar después de mockear
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
    const req = { query: {}, params: {}, body: {}, ...overrides };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();
    return { req, res, next };
}

describe("CartController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getCarts", () => {
        it("CA-01 Obtener todos los carritos", async () => {
            const { req, res, next } = makeReqRes();
            const carts = [{ _id: "c1" }];
            mockCart.find.mockReturnValue(new MockQuery(carts));

            await getCarts(req, res, next);

            expect(mockCart.find).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(carts);
        });
    });

    describe("getCartById", () => {
        it("CA-02 ID válido", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "c1" } });
            const cart = { _id: "c1" };
            mockCart.findById.mockReturnValue(new MockQuery(cart));

            await getCartById(req, res, next);
            expect(res.json).toHaveBeenCalledWith(cart);
        });
    });

    describe("getCartByUser", () => {
        it("CA-04 Usuario con carrito", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "u1" } });
            const cart = { _id: "c1", user: "u1" };
            mockCart.findOne.mockReturnValue(new MockQuery(cart));

            await getCartByUser(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                message: "Cart retrieved successfully",
                cart,
            });
        });

        it("CA-05 Usuario sin carrito", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "u2" } });
            mockCart.findOne.mockReturnValue(new MockQuery(null));

            await getCartByUser(req, res, next);
            expect(res.json).toHaveBeenCalledWith({
                message: "No cart found for this user",
                cart: null,
            });
        });
        it("CA-03b BD falla → next(error) en getCartByUser", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "u2" } });
            const dbError = new Error("DB error");
            mockCart.findOne.mockRejectedValue(dbError);
            await getCartByUser(req, res, next);
            expect(next).toHaveBeenCalledWith(dbError);
            expect(res.status).not.toHaveBeenCalled();
        });
        it("CA-21 BD falla → next(error) en updateCartItem", async () => {
            const { req, res, next } = makeReqRes({ body: { userId: "u1", productId: "p1", quantity: 3 } });
            const dbError = new Error("DB failure");
            mockCart.findOne.mockRejectedValue(dbError);
            await updateCartItem(req, res, next);
            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    describe("addProductToCart", () => {
        it("CA-07 Nuevo carrito para el usuario", async () => {
            const { req, res, next } = makeReqRes({
                body: { userId: "u1", productId: "p1", quantity: 2 },
            });
            mockCart.findOne.mockResolvedValue(null);

            // Mockear el constructor de Cart (new Cart)
            const saveMock = vi.fn().mockResolvedValue(true);
            const populateMock = vi.fn().mockReturnThis();
            mockCart.mockImplementation(function () {
                this.save = saveMock;
                this.populate = populateMock;
                this.products = [{ product: "p1", quantity: 2 }];
            });

            await addProductToCart(req, res, next);

            expect(mockCart).toHaveBeenCalled();
            expect(saveMock).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Product added to cart successfully",
            }));
        });

        it("CA-08 Añadir a carrito existente", async () => {
            const { req, res, next } = makeReqRes({
                body: { userId: "u1", productId: "p1", quantity: 1 },
            });
            const existingCart = {
                products: [{ product: { toString: () => "p1" }, quantity: 1 }],
                save: vi.fn().mockResolvedValue(true),
                populate: vi.fn().mockReturnThis(),
            };
            mockCart.findOne.mockResolvedValue(existingCart);

            await addProductToCart(req, res, next);

            expect(existingCart.products[0].quantity).toBe(2);
            expect(existingCart.save).toHaveBeenCalled();
        });
    });

    describe("updateCartItem", () => {
        it("CA-12 Actualiza cantidad", async () => {
            const { req, res, next } = makeReqRes({
                body: { userId: "u1", productId: "p1", quantity: 5 },
            });
            const existingCart = {
                products: [{ product: { toString: () => "p1" }, quantity: 1 }],
                save: vi.fn().mockResolvedValue(true),
                populate: vi.fn().mockReturnThis(),
            };
            mockCart.findOne.mockResolvedValue(existingCart);

            await updateCartItem(req, res, next);

            expect(existingCart.products[0].quantity).toBe(5);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cart item updated" }));
        });
    });

    describe("clearCartItems", () => {
        it("CA-18 Vacía el carrito", async () => {
            const { req, res, next } = makeReqRes({ body: { userId: "u1" } });
            const existingCart = {
                products: [{ product: "p1" }],
                save: vi.fn().mockResolvedValue(true),
                populate: vi.fn().mockReturnThis(),
            };
            mockCart.findOne.mockResolvedValue(existingCart);

            await clearCartItems(req, res, next);

            expect(existingCart.products).toHaveLength(0);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cart cleared successfully" }));
        });

        it("CA-19 Carrito no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({ body: { userId: "u1" } });
            mockCart.findOne.mockResolvedValue(null);

            await clearCartItems(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cart not found" }));
        });
    });

    describe("removeCartItem", () => {
        it("CA-20 Elimina producto del carrito → 200", async () => {
            const { req, res, next } = makeReqRes({
                params: { productId: "p1" },
                body: { userId: "u1" },
            });
            const existingCart = {
                products: [{ product: { toString: () => "p1" }, quantity: 1 }],
                save: vi.fn().mockResolvedValue(true),
                populate: vi.fn().mockReturnThis(),
            };
            mockCart.findOne.mockResolvedValue(existingCart);

            await removeCartItem(req, res, next);

            expect(existingCart.products).toHaveLength(0);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Product removed from cart" }));
        });

        it("CA-21 Carrito no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({
                params: { productId: "p1" },
                body: { userId: "u1" },
            });
            mockCart.findOne.mockResolvedValue(null);

            await removeCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("getCartById — error path", () => {
        it("CA-22 ID no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockCart.findById.mockReturnValue(new MockQuery(null));

            await getCartById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cart not found" }));
        });
    });

    describe("updateCartItem — error paths", () => {
        it("CA-23 Carrito no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({ body: { userId: "u1", productId: "p1", quantity: 3 } });
            mockCart.findOne.mockResolvedValue(null);

            await updateCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cart not found" }));
        });

        it("CA-24 Producto no en carrito → 404", async () => {
            const { req, res, next } = makeReqRes({ body: { userId: "u1", productId: "p99", quantity: 3 } });
            mockCart.findOne.mockResolvedValue({
                products: [{ product: { toString: () => "p1" }, quantity: 1 }],
            });

            await updateCartItem(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Product not found in Cart" }));
        });
    });

    describe("updateCart", () => {
        it("CA-25 Sin campos en body → 400", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "c1" }, body: {} });

            await updateCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("CA-26 Actualización exitosa → 200", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "c1" },
                body: { products: [{ product: "p1", quantity: 2 }] },
            });
            mockCart.findByIdAndUpdate.mockReturnValue(new MockQuery({ _id: "c1" }));

            await updateCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("CA-27 Carrito no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "xxx" },
                body: { products: [] },
            });
            mockCart.findByIdAndUpdate.mockReturnValue(new MockQuery(null));

            await updateCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("deleteCart", () => {
        it("CA-28 Eliminación exitosa → 204", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "c1" } });
            mockCart.findByIdAndDelete.mockResolvedValue({ _id: "c1" });

            await deleteCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(204);
        });

        it("CA-29 Carrito no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockCart.findByIdAndDelete.mockResolvedValue(null);

            await deleteCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
        it("CA-22 BD falla → next(error) en deleteCart", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "c1" } });
            const dbError = new Error("DB error");
            mockCart.findById.mockReturnValue(new MockQuery({ _id: "c1" }));
            mockCart.findByIdAndDelete.mockRejectedValue(dbError);
            await deleteCart(req, res, next);
            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    describe("createCart", () => {
        it("CA-30 Crea carrito con productos → 201", async () => {
            const { req, res, next } = makeReqRes({
                body: { user: "u1", products: [{ product: "p1", quantity: 1 }] },
            });
            const created = {
                _id: "c2",
                populate: vi.fn().mockResolvedValue(true),
            };
            mockCart.create.mockResolvedValue(created);

            await createCart(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
        });

        it("CA-31 BD falla → next(error)", async () => {
            const { req, res, next } = makeReqRes({ body: { user: "u1", products: [] } });
            const err = new Error("DB down");
            mockCart.create.mockRejectedValue(err);

            await createCart(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});

