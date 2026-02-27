import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── MockQuery para Mongoose API fluida ────────────────────────────────────────
class MockQuery {
    constructor(data = null) { this.data = data; }
    populate = vi.fn().mockReturnThis();
    sort = vi.fn().mockReturnThis();
    skip = vi.fn().mockReturnThis();
    limit = vi.fn().mockReturnThis();
    then(onF, onR) { return Promise.resolve(this.data).then(onF, onR); }
}

const { mockCategory } = vi.hoisted(() => {
    const mockCategory = vi.fn(function (data) {
        Object.assign(this, data);
        this.save = vi.fn().mockResolvedValue(this);
    });
    mockCategory.find = vi.fn();
    mockCategory.findById = vi.fn();
    mockCategory.findByIdAndUpdate = vi.fn();
    mockCategory.findByIdAndDelete = vi.fn();
    mockCategory.countDocuments = vi.fn();
    return { mockCategory };
});

vi.mock("../../models/category.js", () => ({ default: mockCategory }));

import {
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryById,
    searchCategory,
    updateCategory,
} from "../categoryController.js";

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

const sampleCategory = { _id: "cat1", name: "Consolas", description: "Juegos" };

describe("CategoryController", () => {
    beforeEach(() => vi.clearAllMocks());

    // ─── getCategories ────────────────────────────────────────────────────────
    describe("getCategories", () => {
        it("CT-01 Lista completa de categorías → 200", async () => {
            const { req, res, next } = makeReqRes();
            mockCategory.find.mockReturnValue(new MockQuery([sampleCategory]));

            await getCategories(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([sampleCategory]);
        });

        it("CT-02 BD falla → next(error)", async () => {
            const { req, res, next } = makeReqRes();
            const err = new Error("DB down");
            mockCategory.find.mockReturnValue({
                populate: vi.fn().mockReturnThis(),
                sort: vi.fn().mockRejectedValue(err),
            });

            await getCategories(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // ─── getCategoryById ──────────────────────────────────────────────────────
    describe("getCategoryById", () => {
        it("CT-03 Categoría encontrada → 200", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "cat1" } });
            mockCategory.findById.mockReturnValue(new MockQuery(sampleCategory));

            await getCategoryById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(sampleCategory);
        });

        it("CT-04 Categoría no encontrada → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockCategory.findById.mockReturnValue(new MockQuery(null));

            await getCategoryById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Category not found" }));
        });
    });

    // ─── createCategory ───────────────────────────────────────────────────────
    describe("createCategory", () => {
        it("CT-05 Creación exitosa → 201", async () => {
            const { req, res, next } = makeReqRes({
                body: { name: "Accessories", description: "Accesorios" },
            });

            await createCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it("CT-06 BD falla en save → next(error)", async () => {
            const { req, res, next } = makeReqRes({ body: { name: "X" } });
            const err = new Error("save failed");
            // El constructor lanza en save
            mockCategory.mockImplementationOnce(function (data) {
                Object.assign(this, data);
                this.save = vi.fn().mockRejectedValue(err);
            });

            await createCategory(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // ─── updateCategory ───────────────────────────────────────────────────────
    describe("updateCategory", () => {
        it("CT-07 Actualización exitosa → 200", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "cat1" },
                body: { name: "Consolas Updated" },
            });
            mockCategory.findByIdAndUpdate.mockResolvedValue({ ...sampleCategory, name: "Consolas Updated" });

            await updateCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        it("CT-08 Sin campos en body → 400", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "cat1" }, body: {} });
            await updateCategory(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("CT-09 Categoría no encontrada → 404", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "xxx" },
                body: { name: "Ghost" },
            });
            mockCategory.findByIdAndUpdate.mockResolvedValue(null);

            await updateCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("CT-10 BD falla → next(error) en updateCategory", async () => {
            const { req, res, next } = makeReqRes({
                params: { id: "cat1" },
                body: { name: "Updated" },
            });
            mockCategory.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));
            await updateCategory(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    // ─── deleteCategory ───────────────────────────────────────────────────────
    describe("deleteCategory", () => {
        it("CT-10 Eliminación exitosa → 204", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "cat1" } });
            mockCategory.findByIdAndDelete.mockResolvedValue(sampleCategory);

            await deleteCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(204);
        });

        it("CT-11 Categoría no encontrada → 404", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "xxx" } });
            mockCategory.findByIdAndDelete.mockResolvedValue(null);

            await deleteCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it("CT-12 BD falla → next(error) en deleteCategory", async () => {
            const { req, res, next } = makeReqRes({ params: { id: "cat1" } });
            mockCategory.findByIdAndDelete.mockRejectedValue(new Error("DB error"));
            await deleteCategory(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    // ─── searchCategory ───────────────────────────────────────────────────────
    describe("searchCategory", () => {
        it("CT-12 Búsqueda por nombre con resultados → 200 + paginación", async () => {
            const { req, res, next } = makeReqRes({ query: { q: "Consola" } });
            mockCategory.find.mockReturnValue(new MockQuery([sampleCategory]));
            mockCategory.countDocuments.mockResolvedValue(1);

            await searchCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ categories: [sampleCategory] })
            );
        });

        // CT-13b: Sin resultados devuelve 200 con arreglo vacío y paginación consistente
        it("CT-13b Sin resultados → 200 con categorías vacías", async () => {
            const { req, res, next } = makeReqRes({ query: { q: "NonExisting" } });
            mockCategory.find.mockReturnValue(new MockQuery([]));
            mockCategory.countDocuments.mockResolvedValue(0);

            await searchCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ categories: [] }));
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ pagination: expect.objectContaining({ totalPages: 0, totalResults: 0, currentPage: 1 }) }));
        });

        it("CT-13 Sin filtros → todos los resultados", async () => {
            const { req, res, next } = makeReqRes({ query: {} });
            mockCategory.find.mockReturnValue(new MockQuery([sampleCategory]));
            mockCategory.countDocuments.mockResolvedValue(1);

            await searchCategory(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
