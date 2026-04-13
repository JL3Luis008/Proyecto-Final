import express from "express";

import authRoutes from "./authRoutes.js";
import cartRoutes from "./cartRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentMethodRoutes from "./paymentMethodRoutes.js";
import productRoutes from "./productRoutes.js";
import shippingAddressRoutes from "./shippingAddressRoutes.js";
import userRoutes from "./userRoutes.js";
import wishListRoutes from "./wishListRoutes.js";
import testRoutes from "./testRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use(cartRoutes);
router.use(categoryRoutes);
router.use(notificationRoutes);
router.use(orderRoutes);
router.use(paymentMethodRoutes);
router.use(userRoutes);
router.use(wishListRoutes);
router.use(productRoutes);
router.use(shippingAddressRoutes);

// Rutas de utilidad para pruebas (solo desarrollo/test)
if (process.env.NODE_ENV !== "production") {
  router.use("/test", testRoutes);
}

export default router;
