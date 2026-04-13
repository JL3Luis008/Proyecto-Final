import express from "express";
import { resetDatabase, seedDatabase } from "../controllers/testController.js";

const router = express.Router();

// Ruta para resetear la base de datos (E2E testing)
router.post("/reset-db", resetDatabase);

// Ruta para añadir productos de prueba para Cypress
router.post("/seed-products", seedDatabase);

export default router;
