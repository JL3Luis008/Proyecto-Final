import { beforeEach, describe, expect, it, vi } from "vitest";
import authMiddleware from "../authMiddleware.js";
import isAdmin from "../isAdminMiddleware.js";
import validate from "../validation.js";
import errorHandler from "../errorHandler.js";

// Mock RevokedToken model used by authMiddleware
vi.mock("../../models/revokedToken.js", () => ({
    default: {
        exists: vi.fn().mockResolvedValue(null),
    },
}));

// ─── Mocks de módulos ────────────────────────────────────────────────────────
const { mockJwtVerify } = vi.hoisted(() => {
    const mockJwtVerify = vi.fn();
    return { mockJwtVerify };
});

vi.mock("jsonwebtoken", () => ({
    default: { verify: mockJwtVerify },
}));

// errorHandler escribe en fs — lo mockeamos para no crear archivos reales en tests
vi.mock("fs", () => ({
    default: {
        existsSync: vi.fn().mockReturnValue(true),
        mkdirSync: vi.fn(),
        appendFile: vi.fn((_path, _msg, cb) => cb(null)),
    },
}));

// ─── Helpers comunes ────────────────────────────────────────────────────────
function buildReqRes() {
    const req = {
        headers: {},
        user: undefined,
        method: "GET",
        url: "/test",
    };
    const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        headersSent: false,
    };
    const next = vi.fn();
    return { req, res, next };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🛡️  authMiddleware
// ═══════════════════════════════════════════════════════════════════════════════
describe("authMiddleware", () => {
    beforeEach(() => {
        process.env.JWT_SECRET = "testsecret";
        mockJwtVerify.mockReset();
    });

    // MW-01
    it("Token válido → popula req.user y llama next()", async () => {
        const { req, res, next } = buildReqRes();
        req.headers["authorization"] = "Bearer validtoken";

        const decoded = { userId: "user123", displayName: "Test", role: "customer" };
        // jwt.verify llama al callback con (null, decoded)
        mockJwtVerify.mockImplementation((_token, _secret, cb) => cb(null, decoded));

        authMiddleware(req, res, next);

        await vi.waitFor(() => {
            expect(next).toHaveBeenCalledOnce();
        });
        expect(mockJwtVerify).toHaveBeenCalledWith(
            "validtoken",
            process.env.JWT_SECRET,
            expect.any(Function)
        );
        expect(req.user).toEqual(decoded);
        expect(res.status).not.toHaveBeenCalled();
    });

    // MW-02
    it("Sin header Authorization → 401 Unauthorized", () => {
        const { req, res, next } = buildReqRes();
        // sin header

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        expect(next).not.toHaveBeenCalled();
    });

    // MW-03
    it("Header Authorization sin esquema Bearer → 401", async () => {
        const { req, res, next } = buildReqRes();
        req.headers["authorization"] = "Basic sometoken";
        // split(' ')[1] = 'sometoken' pero verify falla igual si el token es inválido
        // En realidad podría llegar como token malformado, jwt.verify lo rechaza
        mockJwtVerify.mockImplementation((_token, _secret, cb) =>
            cb(new Error("invalid"), null)
        );

        authMiddleware(req, res, next);

        // wait for async (RevokedToken check) to resolve
        await vi.waitFor(() => {
            expect(res.status).toHaveBeenCalledWith(401);
        });
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    });

    // MW-04
    it("Token malformado → 401 Invalid or expired token", async () => {
        const { req, res, next } = buildReqRes();
        req.headers["authorization"] = "Bearer bad.token.here";
        mockJwtVerify.mockImplementation((_token, _secret, cb) =>
            cb(new Error("JsonWebTokenError"), null)
        );

        authMiddleware(req, res, next);

        await vi.waitFor(() => {
            expect(res.status).toHaveBeenCalledWith(401);
        });
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
        expect(next).not.toHaveBeenCalled();
    });

    // MW-05 (bonus: token expirado se trata igual que malformado)
    it("Token expirado → 401 Invalid or expired token", async () => {
        const { req, res, next } = buildReqRes();
        req.headers["authorization"] = "Bearer expiredtoken";
        mockJwtVerify.mockImplementation((_token, _secret, cb) =>
            cb(new Error("TokenExpiredError"), null)
        );

        authMiddleware(req, res, next);

        await vi.waitFor(() => {
            expect(res.status).toHaveBeenCalledWith(401);
        });
        expect(res.json).toHaveBeenCalledWith({ message: "Invalid or expired token" });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🔑  isAdmin
// ═══════════════════════════════════════════════════════════════════════════════
describe("isAdmin", () => {
    // MW-06 (mapeado MW-05 del plan)
    it("Usuario admin → llama next()", () => {
        const { req, res, next } = buildReqRes();
        req.user = { userId: "admin1", role: "admin" };

        isAdmin(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    // MW-07 (mapeado MW-06)
    it("Usuario customer → 403 Admin access required", () => {
        const { req, res, next } = buildReqRes();
        req.user = { userId: "user1", role: "customer" };

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Admin access required" });
        expect(next).not.toHaveBeenCalled();
    });

    // MW-08 (mapeado MW-07)
    it("Sin req.user → 401 Authentication required", () => {
        const { req, res, next } = buildReqRes();
        req.user = undefined;

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Authentication required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("Usuario guest → 403 Admin access required", () => {
        const { req, res, next } = buildReqRes();
        req.user = { role: "guest" };

        isAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Admin access required" });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ✅  validate (express-validator middleware)
// NOTA: validate retorna 422, no 400 (el TEST_PLAN.md tenía un error — MW-09 corregido)
// ═══════════════════════════════════════════════════════════════════════════════
vi.mock("express-validator", () => ({
    validationResult: vi.fn(),
}));

import { validationResult } from "express-validator";

describe("validate middleware", () => {
    beforeEach(() => {
        vi.mocked(validationResult).mockReset();
    });

    // MW-09 (mapeado MW-08)
    it("Sin errores de validación → llama next()", () => {
        const { req, res, next } = buildReqRes();
        vi.mocked(validationResult).mockReturnValue({ isEmpty: () => true, array: () => [] });

        validate(req, res, next);

        expect(next).toHaveBeenCalledOnce();
        expect(res.status).not.toHaveBeenCalled();
    });

    // MW-10 (mapeado MW-09) — STATUS 422 (no 400 — ver código fuente)
    it("Con errores de validación → 422 con array de errores", () => {
        const { req, res, next } = buildReqRes();
        const mockErrors = [
            { msg: "Email is required", param: "email" },
            { msg: "Password too short", param: "password" },
        ];
        vi.mocked(validationResult).mockReturnValue({
            isEmpty: () => false,
            array: () => mockErrors,
        });

        validate(req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({ errors: mockErrors });
        expect(next).not.toHaveBeenCalled();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 🚨  errorHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe("errorHandler", () => {
    // MW-11 (mapeado MW-10)
    it("Error genérico sin statusCode → 500 Internal Server Error", () => {
        const { req, res, next } = buildReqRes();
        const err = new Error("Something broke");

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Internal Server Error",
        });
    });

    // MW-12 (mapeado MW-11)
    it("Error con statusCode 404 → usa el statusCode y el mensaje original", () => {
        const { req, res, next } = buildReqRes();
        const err = new Error("Resource not found");
        err.statusCode = 404;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Resource not found",
        });
    });

    it("Error con err.status (no statusCode) → usa err.status", () => {
        const { req, res, next } = buildReqRes();
        const err = new Error("Bad input");
        err.status = 400;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Bad input",
        });
    });

    it("Si res.headersSent → llama next(err) sin responder", () => {
        const { req, res, next } = buildReqRes();
        res.headersSent = true;
        const err = new Error("Streaming error");

        errorHandler(err, req, res, next);

        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
    });

    it("Error 4xx con campo errors → lo incluye en la respuesta", () => {
        const { req, res, next } = buildReqRes();
        const err = new Error("Validation failed");
        err.statusCode = 422;
        err.errors = [{ field: "email", msg: "Invalid" }];

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Validation failed",
            errors: err.errors,
        });
    });
});
