import express from "express";
import { body, param } from "express-validator";
import {
  addProductToCart,
  createCart,
  deleteCart,
  getCartById,
  getCartByUser,
  getCarts,
  updateCart,
  updateCartItem,
  removeCartItem,
  clearCartItems,
} from "../controllers/cartController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";
import validate from "../middlewares/validation.js";
import {
  mongoIdValidation,
  bodyMongoIdValidation,
  quantityValidation,
} from "../middlewares/validators.js";

const router = express.Router();

// --- SPECIFIC ROUTES ---

// Get current user's cart
router.get("/cart/my-cart", authMiddleware, getCartByUser);

// Add product to cart (uses session userId)
router.post(
  "/cart/add-product",
  authMiddleware,
  [
    bodyMongoIdValidation("productId", "Product ID"),
    quantityValidation("quantity", true),
  ],
  validate,
  addProductToCart,
);

// Update item quantity in session cart
router.put(
  "/cart/update-item",
  authMiddleware,
  [
    bodyMongoIdValidation("productId", "Product ID"),
    quantityValidation("quantity", true),
  ],
  validate,
  updateCartItem,
);

// Remove item from session cart
router.delete(
  "/cart/remove-item/:productId",
  authMiddleware,
  [
    mongoIdValidation("productId", "Product ID"),
  ],
  validate,
  removeCartItem,
);

// Clear session cart
router.post(
  "/cart/clear",
  authMiddleware,
  clearCartItems,
);

// Admin only: Get all carts
router.get("/cart", authMiddleware, isAdmin, getCarts);

// --- PARAMETERIZED ROUTES ---

// Get specific cart by ID (Admin or Owner)
router.get(
  "/cart/:id",
  authMiddleware,
  [mongoIdValidation("id", "Cart ID")],
  validate,
  getCartById,
);

// Create cart
router.post(
  "/cart",
  authMiddleware,
  [
    body("products")
      .notEmpty()
      .withMessage("Products are required")
      .isArray({ min: 1 })
      .withMessage("Products must be a non-empty array"),
    bodyMongoIdValidation("products.*.product", "Product ID"),
    quantityValidation("products.*.quantity"),
  ],
  validate,
  createCart,
);

// Update cart
router.put(
  "/cart/:id",
  authMiddleware,
  [
    mongoIdValidation("id", "Cart ID"),
    body("products")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Products must be a non-empty array"),
    bodyMongoIdValidation("products.*.product", "Product ID", true),
    quantityValidation("products.*.quantity", true),
  ],
  validate,
  updateCart,
);

// Delete cart
router.delete(
  "/cart/:id",
  authMiddleware,
  [mongoIdValidation("id", "Cart ID")],
  validate,
  deleteCart,
);

export default router;
