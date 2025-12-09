import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import validate from '../middlewares/validation.js';

const router = express.Router();

router.post('/register',
  [
    body('displayName')
      .notEmpty().withMessage('displayName is required')
      .isLength({ min: 2, max: 50 }).withMessage('displayName must be between 2 and 50 characters')
      .matches(/^[a-zA-Z0-9\s]+$/).withMessage('displayName must contain only letters, numbers and spaces'),
    body('email')
      .notEmpty().withMessage('email is required')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
      .matches(/\d/).withMessage('Pasword must contain at least one number')
      .matches(/[a-zA-Z]/).withMessage('Password must contain at least one letter'),
    body('phone')
      .notEmpty().withMessage('Phone is required')
      .isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits')
      .isNumeric().withMessage('Phone must contain only numbers'),
    body('role')
      .optional()
      .isIn(["Administrator", "Customer", "Guest"]).withMessage('Role must to be Administrator,customer or guest'),
    body('avatar')
      .optional()
      .isURL().withMessage('Avatar must be a valid URL')
  ]
  , validate, register);

router.post('/login', [
  body('email')
    .notEmpty().withMessage('email is required')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
], validate, login);

export default router;