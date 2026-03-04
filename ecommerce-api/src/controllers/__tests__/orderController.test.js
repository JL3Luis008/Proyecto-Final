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

const { mockOrder, mockProduct } = vi.hoisted(() => {
    const mockOrder = vi.fn(function (data) {
        Object.assign(this, data);
        this.save = vi.fn().mockResolvedValue(this);
        this.populate = vi.fn().mockResolvedValue(this);
    });
    mockOrder.find = vi.fn();
    mockOrder.findById = vi.fn();
    mockOrder.findByIdAndUpdate = vi.fn();
    mockOrder.findByIdAndDelete = vi.fn();
    mockOrder.create = vi.fn();

    const mockProduct = {
        findById: vi.fn(),
        findByIdAndUpdate: vi.fn(),
    };
    return { mockOrder, mockProduct };
});

vi.mock("../../models/order.js", () => ({ default: mockOrder }));
vi.mock("../../models/product.js", () => ({ default: mockProduct }));

import {
    cancelOrder,
    createOrder,
    deleteOrder,
    getOrderById,
    getOrders,
    getOrdersByUser,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
} from "../orderController.js";

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

const sampleOrder = {
    _id: "o1",
    user: "u1",
    products: [{ productId: { _id: "p1", name: "G", price: 10 }, quantity: 1, price: 10 }],
    status: "pending",
    populate: vi.fn().mockResolvedValue(true),
};

describe("OrderController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getOrders", () => {
        it("OR-01 Obtener todas las órdenes", async () => {
            const { req, res, next } = makeReqRes();
            mockOrder.find.mockReturnValue(new MockQuery([sampleOrder]));

            await getOrders(req, res, next);
            expect(res.json).toHaveBeenCalledWith([sampleOrder]);
        });
    });

    describe("getOrderById", () => {
        it("OR-02 Obtener orden por ID válido", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" } });
            mockOrder.findById.mockReturnValue(new MockQuery(sampleOrder));

            await getOrderById(req, res, next);
            expect(res.json).toHaveBeenCalledWith(sampleOrder);
        });

        it("OR-03 Orden no encontrada", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockOrder.findById.mockReturnValue(new MockQuery(null));

            await getOrderById(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Order not found" }));
        });
    });

    describe("getOrdersByUser", () => {
        it("OR-06 Obtener órdenes del usuario", async () => {
            const { req, res, next } = makeReqRes({ params: { userId: "u1" } });
            mockOrder.find.mockReturnValue(new MockQuery([sampleOrder]));

            await getOrdersByUser(req, res, next);
            expect(res.json).toHaveBeenCalledWith([sampleOrder]);
        });
    });

    describe("createOrder", () => {
        const body = {
            user: "u1",
            products: [{ productId: "p1", quantity: 1 }],
            shippingAddress: "a1",
            paymentMethod: "m1",
        };

        it("OR-04 Creación exitosa", async () => {
            const { req, res, next } = makeReqRes({ body });
            mockProduct.findById.mockResolvedValue({ _id: "p1", name: "G", stock: 10, price: 10 });
            mockProduct.findByIdAndUpdate.mockResolvedValue({ _id: "p1", stock: 9 });
            mockOrder.create.mockResolvedValue({ ...sampleOrder, populate: vi.fn().mockResolvedValue(sampleOrder) });

            await createOrder(req, res, next);

            expect(mockProduct.findByIdAndUpdate).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("OR-05 Stock insuficiente", async () => {
            const { req, res, next } = makeReqRes({ body });
            mockProduct.findById.mockResolvedValue({ _id: "p1", name: "G", stock: 0, price: 10 });

            await createOrder(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Cannot create order due to stock issues" }));
        });
    });

    describe("updateOrder", () => {
        it("OR-07 Actualización exitosa", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" }, body: { status: "processing" } });
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery({ ...sampleOrder, status: "processing" }));

            await updateOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Sin campos para actualizar → 400", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" }, body: { invalidField: "xxx" } });

            await updateOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("Orden no encontrada", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" }, body: { status: "processing" } });
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery(null));

            await updateOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("updateOrderStatus", () => {
        it("OR-09 Actualizar estado", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" }, body: { status: "delivered" } });
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery({ ...sampleOrder, status: "delivered" }));

            await updateOrderStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Orden no encontrada en update status", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" }, body: { status: "delivered" } });
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery(null));

            await updateOrderStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("updatePaymentStatus", () => {
        it("OR-10 Actualizar estado de pago", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" }, body: { paymentStatus: "paid" } });
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery({ ...sampleOrder, paymentStatus: "paid" }));

            await updatePaymentStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("Orden no encontrada en update payment", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" }, body: { paymentStatus: "paid" } });
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery(null));

            await updatePaymentStatus(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe("cancelOrder", () => {
        it("OR-07 Cancelar orden → restaura stock", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" } });
            const orderToCancel = {
                ...sampleOrder,
                products: [{ productId: { _id: "p1" }, quantity: 1 }],
            };
            mockOrder.findById.mockReturnValue(new MockQuery(orderToCancel));
            mockProduct.findByIdAndUpdate.mockResolvedValue(true);
            mockOrder.findByIdAndUpdate.mockReturnValue(new MockQuery({ ...orderToCancel, status: "cancelled" }));

            await cancelOrder(req, res, next);

            expect(mockProduct.findByIdAndUpdate).toHaveBeenCalledWith("p1", { $inc: { stock: 1 } }, { new: true });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("OR-08 Orden no encontrada al cancelar", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockOrder.findById.mockReturnValue(new MockQuery(null));

            await cancelOrder(req, res, next);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("OR-11 Orden ya cancelada", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" } });
            mockOrder.findById.mockReturnValue(new MockQuery({ ...sampleOrder, status: "cancelled" }));

            await cancelOrder(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Cannot cancel order") }));
        });
    });

    describe("deleteOrder", () => {
        it("OR-13 Solo borra canceladas", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" } });
            mockOrder.findById.mockResolvedValue({ status: "pending" });

            await deleteOrder(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Only cancelled orders can be deleted" }));
        });

        it("Eliminación exitosa", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "o1" } });
            mockOrder.findById.mockResolvedValue({ status: "cancelled" });
            mockOrder.findByIdAndDelete.mockResolvedValue({ _id: "o1" });

            await deleteOrder(req, res, next);

            expect(res.status).toHaveBeenCalledWith(204);
        });

        it("Orden no encontrada en delete", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockOrder.findById.mockResolvedValue(null);

            await deleteOrder(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
