import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    createProduct,
    deleteProduct,
    getProductByCategory,
    getProductById,
    getProducts,
    searchProducts,
    updateProduct,
} from "../productController.js";

// ─── vi.hoisted — variables disponibles antes del hoisting de vi.mock ─────────
const {
    mockProductFind,
    mockProductFindById,
    mockProductFindByIdAndUpdate,
    mockProductFindByIdAndDelete,
    mockProductCreate,
    mockProductCountDocuments,
    mockProductPopulate,
    mockProductSkip,
    mockProductLimit,
    mockProductSort,
} = vi.hoisted(() => {
    const mockProductPopulate = vi.fn();
    const mockProductSort = vi.fn();
    const mockProductSkip = vi.fn();
    const mockProductLimit = vi.fn();
    const mockProductFind = vi.fn();
    const mockProductFindById = vi.fn();
    const mockProductFindByIdAndUpdate = vi.fn();
    const mockProductFindByIdAndDelete = vi.fn();
    const mockProductCreate = vi.fn();
    const mockProductCountDocuments = vi.fn();

    return {
        mockProductFind,
        mockProductFindById,
        mockProductFindByIdAndUpdate,
        mockProductFindByIdAndDelete,
        mockProductCreate,
        mockProductCountDocuments,
        mockProductPopulate,
        mockProductSkip,
        mockProductLimit,
        mockProductSort,
    };
});

// Mock del modelo Product
vi.mock("../../models/product.js", () => ({
    default: {
        find: mockProductFind,
        findById: mockProductFindById,
        findByIdAndUpdate: mockProductFindByIdAndUpdate,
        findByIdAndDelete: mockProductFindByIdAndDelete,
        create: mockProductCreate,
        countDocuments: mockProductCountDocuments,
    },
}));

// Mock del modelo Category (usado en searchProducts para descendientes)
vi.mock("../../models/category.js", () => ({
    default: {
        find: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue([]),
        }),
    },
}));

// productController importa errorHandler — no hace nada crítico en tests unitarios
vi.mock("../../middlewares/errorHandler.js", () => ({ default: vi.fn() }));

// ─── Helper para cadenas de Mongoose fluidas ──────────────────────────────────
function buildChain(resolvedValue) {
    const chain = {
        populate: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        sort: vi.fn().mockResolvedValue(resolvedValue),
    };
    return chain;
}

// ─── Datos de prueba reutilizables ────────────────────────────────────────────
const sampleProduct = {
    _id: "prod123",
    name: "Super Mario Bros",
    description: "Classic NES platformer",
    company: "Nintendo",
    price: 29.99,
    stock: 5,
    imagesUrl: ["https://example.com/mario.jpg"],
    category: { _id: "cat1", name: "NES" },
};

// ─── Helpers de req/res ────────────────────────────────────────────────────────
function makeReqRes(overrides = {}) {
    const req = {
        query: {},
        params: {},
        body: {},
        ...overrides,
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
    };
    const next = vi.fn();
    return { req, res, next };
}

// ═══════════════════════════════════════════════════════════════════════════════
describe("ProductController", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ─── getProducts ──────────────────────────────────────────────────────────
    describe("getProducts", () => {
        // PR-01
        it("PR-01 Listado paginado básico (page=1, limit=10)", async () => {
            const { req, res, next } = makeReqRes({ query: { page: "1", limit: "10" } });

            const products = [sampleProduct];
            mockProductFind.mockReturnValue(buildChain(products));
            mockProductCountDocuments.mockResolvedValue(1);

            await getProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    products,
                    pagination: expect.objectContaining({
                        currentPage: 1,
                        totalPages: 1,
                        totalResults: 1,
                    }),
                })
            );
            expect(next).not.toHaveBeenCalled();
        });

        // PR-02
        it("PR-02 Paginación personalizada (page=2, limit=5)", async () => {
            const { req, res, next } = makeReqRes({ query: { page: "2", limit: "5" } });

            const products = [];
            const chain = buildChain(products);
            mockProductFind.mockReturnValue(chain);
            mockProductCountDocuments.mockResolvedValue(6);

            await getProducts(req, res, next);

            expect(chain.skip).toHaveBeenCalledWith(5); // (2-1)*5=5
            expect(chain.limit).toHaveBeenCalledWith(5);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    pagination: expect.objectContaining({
                        currentPage: 2,
                        totalPages: 2,
                        totalResults: 6,
                    }),
                })
            );
        });

        // PR-03
        it("PR-03 BD falla → llama next(error)", async () => {
            const { req, res, next } = makeReqRes({ query: {} });
            const dbError = new Error("DB connection failed");
            mockProductFind.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockReturnThis(),
                sort: vi.fn().mockRejectedValue(dbError),
            });

            await getProducts(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    // ─── getProductById ───────────────────────────────────────────────────────
    describe("getProductById", () => {
        // PR-04
        it("PR-04 ID válido → producto con category populada", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "prod123" } });

            mockProductFindById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(sampleProduct),
            });

            await getProductById(req, res, next);

            expect(mockProductFindById).toHaveBeenCalledWith("prod123");
            expect(res.json).toHaveBeenCalledWith(sampleProduct);
            expect(next).not.toHaveBeenCalled();
        });

        // PR-05
        it("PR-05 ID no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "nonexistent" } });

            mockProductFindById.mockReturnValue({
                populate: vi.fn().mockResolvedValue(null),
            });

            await getProductById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
        });

        // PR-06
        it("PR-06 BD falla → llama next(error)", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "prod123" } });
            const dbError = new Error("DB error");

            mockProductFindById.mockReturnValue({
                populate: vi.fn().mockRejectedValue(dbError),
            });

            await getProductById(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    // ─── getProductByCategory ─────────────────────────────────────────────────
    describe("getProductByCategory", () => {
        // PR-07
        it("PR-07 Productos de categoría encontrados", async () => {
            const { req, res, next } = makeReqRes({ params: { idCategory: "cat1" } });
            const products = [sampleProduct];

            mockProductFind.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue(products),
            });

            await getProductByCategory(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith({ category: "cat1" });
            expect(res.json).toHaveBeenCalledWith(products);
        });

        // PR-08
        it("PR-08 Sin productos en categoría → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { idCategory: "emptyCat" } });

            mockProductFind.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockResolvedValue([]),
            });

            await getProductByCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "No products found on this category",
            });
        });
    });

    // ─── createProduct ────────────────────────────────────────────────────────
    describe("createProduct", () => {
        const validBody = {
            name: "Donkey Kong",
            description: "Arcade classic",
            company: "Nintendo",
            price: 19.99,
            stock: 10,
            imagesUrl: ["https://example.com/dk.jpg"],
            category: "cat1",
            details: "Classic details",
            includes: "Game disk",
            condition: "New",
            region: "Global",
        };

        // PR-09
        it("PR-09 Creación exitosa → 201 con el producto creado", async () => {
            const { req, res, next } = makeReqRes({ body: validBody });
            const created = { _id: "newProd", ...validBody };
            mockProductCreate.mockResolvedValue(created);

            await createProduct(req, res, next);

            expect(mockProductCreate).toHaveBeenCalledWith(validBody);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(created);
            expect(next).not.toHaveBeenCalled();
        });

        // PR-10 — createProduct usa inline if(!name), key 'error' (no 'message')
        it("PR-10 Campo name faltante → 400 con key 'error'", async () => {
            const { req, res, next } = makeReqRes({
                body: { ...validBody, name: undefined },
            });

            await createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
            expect(mockProductCreate).not.toHaveBeenCalled();
        });

        // PR-11
        it("PR-11 Campo price faltante → 400 con key 'error'", async () => {
            const { req, res, next } = makeReqRes({
                body: { ...validBody, price: undefined },
            });

            await createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Price is required" });
        });

        it("PR-11b Campo stock faltante → 400", async () => {
            const { req, res, next } = makeReqRes({
                body: { ...validBody, stock: undefined },
            });

            await createProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Stock is required" });
        });

        // PR-12
        it("PR-12 BD falla en Product.create → llama next(error)", async () => {
            const { req, res, next } = makeReqRes({ body: validBody });
            const dbError = new Error("Create failed");
            mockProductCreate.mockRejectedValue(dbError);

            await createProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    // ─── updateProduct ────────────────────────────────────────────────────────
    describe("updateProduct", () => {
        // NOTA: updateProduct usa 'console' (no 'company') — campo raro, pero es el código real
        const validUpdateBody = {
            name: "Updated Mario",
            description: "Updated desc",
            company: "Nintendo",
            price: 34.99,
            stock: 8,
            imagesUrl: ["https://example.com/mario2.jpg"],
            category: "cat1",
            details: undefined,
            includes: undefined,
            condition: undefined,
            region: undefined,
        };

        // PR-13
        it("PR-13 Actualización exitosa → 200", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "prod123" },
                body: validUpdateBody,
            });
            const updated = { _id: "prod123", ...validUpdateBody };
            mockProductFindByIdAndUpdate.mockResolvedValue(updated);

            await updateProduct(req, res, next);

            expect(mockProductFindByIdAndUpdate).toHaveBeenCalledWith(
                "prod123",
                validUpdateBody,
                { new: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updated);
        });

        // PR-14
        it("PR-14 ID no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "nonexistent" },
                body: validUpdateBody,
            });
            mockProductFindByIdAndUpdate.mockResolvedValue(null);

            await updateProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
        });

        // PR-15
        it("PR-15 BD falla → llama next(error)", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "prod123" },
                body: validUpdateBody,
            });
            const dbError = new Error("Update failed");
            mockProductFindByIdAndUpdate.mockRejectedValue(dbError);

            await updateProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });

        it("Campo name faltante en updateProduct → 400", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "prod123" },
                body: { ...validUpdateBody, name: undefined },
            });

            await updateProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: "Name is required" });
        });
    });

    // ─── deleteProduct ────────────────────────────────────────────────────────
    describe("deleteProduct", () => {
        // PR-16
        it("PR-16 Eliminación exitosa → 204 sin body", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "prod123" } });
            mockProductFindByIdAndDelete.mockResolvedValue(sampleProduct);

            await deleteProduct(req, res, next);

            expect(mockProductFindByIdAndDelete).toHaveBeenCalledWith("prod123");
            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        // PR-17
        it("PR-17 ID no encontrado → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "nonexistent" } });
            mockProductFindByIdAndDelete.mockResolvedValue(null);

            await deleteProduct(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Product not found" });
        });

        it("BD falla → llama next(error)", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "prod123" } });
            const dbError = new Error("Delete failed");
            mockProductFindByIdAndDelete.mockRejectedValue(dbError);

            await deleteProduct(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });

    // ─── searchProducts ───────────────────────────────────────────────────────
    describe("searchProducts", () => {
        function buildSearchChain(results) {
            return {
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue(results),
            };
        }

        // PR-18
        it("PR-18 Búsqueda por texto (q=mario)", async () => {
            const { req, res, next } = makeReqRes({ query: { q: "mario" } });
            const products = [sampleProduct];
            mockProductFind.mockReturnValue(buildSearchChain(products));
            mockProductCountDocuments.mockResolvedValue(1);

            await searchProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith(
                expect.objectContaining({
                    $or: expect.arrayContaining([
                        expect.objectContaining({ name: expect.any(Object) }),
                    ]),
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        // PR-19
        it("PR-19 Filtro por categoría", async () => {
            const { req, res, next } = makeReqRes({ query: { category: "cat1" } });
            mockProductFind.mockReturnValue(buildSearchChain([]));
            mockProductCountDocuments.mockResolvedValue(0);

            await searchProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith(
                expect.objectContaining({ category: { $in: expect.arrayContaining(["cat1"]) } })
            );
        });

        // PR-20
        it("PR-20 Filtro por rango de precio (minPrice=10, maxPrice=50)", async () => {
            const { req, res, next } = makeReqRes({
                query: { minPrice: "10", maxPrice: "50" },
            });
            mockProductFind.mockReturnValue(buildSearchChain([]));
            mockProductCountDocuments.mockResolvedValue(0);

            await searchProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith(
                expect.objectContaining({
                    price: { $gte: 10, $lte: 50 },
                })
            );
        });

        // PR-21
        it("PR-21 Filtro inStock=true → stock $gt 0", async () => {
            const { req, res, next } = makeReqRes({ query: { inStock: "true" } });
            mockProductFind.mockReturnValue(buildSearchChain([]));
            mockProductCountDocuments.mockResolvedValue(0);

            await searchProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith(
                expect.objectContaining({ stock: { $gt: 0 } })
            );
        });

        // PR-22
        it("PR-22 Filtro inStock=false → stock $gte 0", async () => {
            const { req, res, next } = makeReqRes({ query: { inStock: "false" } });
            mockProductFind.mockReturnValue(buildSearchChain([]));
            mockProductCountDocuments.mockResolvedValue(0);

            await searchProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith(
                expect.objectContaining({ stock: { $gte: 0 } })
            );
        });

        // PR-23
        it("PR-23 Ordenamiento por price descendente", async () => {
            const { req, res, next } = makeReqRes({
                query: { sort: "price", order: "desc" },
            });
            const chain = buildSearchChain([]);
            mockProductFind.mockReturnValue(chain);
            mockProductCountDocuments.mockResolvedValue(0);

            await searchProducts(req, res, next);

            expect(chain.sort).toHaveBeenCalledWith({ price: -1 });
        });

        // PR-24
        it("PR-24 Sin filtros → busca con filtro vacío base + stock $gte 0", async () => {
            const { req, res, next } = makeReqRes({ query: {} });
            mockProductFind.mockReturnValue(buildSearchChain([]));
            mockProductCountDocuments.mockResolvedValue(0);

            await searchProducts(req, res, next);

            expect(mockProductFind).toHaveBeenCalledWith(
                expect.objectContaining({ stock: { $gte: 0 } })
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        // PR-25
        it("PR-25 BD falla → llama next(error)", async () => {
            const { req, res, next } = makeReqRes({ query: {} });
            const dbError = new Error("Search failed");
            mockProductFind.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockReturnThis(),
                skip: vi.fn().mockReturnThis(),
                limit: vi.fn().mockRejectedValue(dbError),
            });

            await searchProducts(req, res, next);

            expect(next).toHaveBeenCalledWith(dbError);
        });
    });
});
