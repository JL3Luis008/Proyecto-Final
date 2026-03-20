import express from "express";
import { body, query } from "express-validator";
import {
  checkEmail,
  login,
  register,
  refreshToken,
  logout
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validation.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  displayNameValidation,
  emailValidation,
  passwordValidation,
  phoneValidation,
  urlValidation,
  roleValidation,
  queryEmailValidation,
  passwordLoginValidation,
} from "../middlewares/validators.js";

const router = express.Router();

// Aplicar rate limiting a todas las rutas de autenticación
router.use(authLimiter);

router.post(
  "/register",
  [
    displayNameValidation(),
    emailValidation(),
    passwordValidation(),
    phoneValidation(),
    roleValidation(),
    urlValidation("avatar"),
  ],
  validate,
  register,
);

router.post(
  "/login",
  [emailValidation(), passwordLoginValidation()],
  validate,
  login,
);

router.post("/refresh", refreshToken);

router.get("/check-email", [queryEmailValidation()], validate, checkEmail);

router.post("/logout", authMiddleware, logout);

export default router;
