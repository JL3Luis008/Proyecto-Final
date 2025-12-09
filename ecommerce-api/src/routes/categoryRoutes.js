import express from "express";
import { query } from "express-validator";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
} from "../controllers/categoryController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdministrator from "../middlewares/isAdministratorMiddleware.js";

const router = express.Router();
router.get(
  "/categories/search",
  [
    query("parentCategory")
      .optional()
      .isMongoId()
      .withMessage("formato invalido para el id de categoria"),
  ],
 searchCategories
);
router.get("/categories", getCategories);
router.get("/categories/:id", getCategoryById);
router.post("/categories", authMiddleware, isAdministrator, createCategory);
router.put("/categories/:id", authMiddleware, isAdministrator, updateCategory);
router.delete("/categories/:id", authMiddleware, isAdministrator, deleteCategory);

export default router;
