import express from 'express';
import {
  getOrders,
  getOrderById,
  getOrdersByUser,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdministrator from '../middlewares/isAdministratorMiddleware.js';

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/orders', authMiddleware, isAdministrator, getOrders);

// Obtener órdenes por usuario
router.get('/orders/user/:userId', authMiddleware, getOrdersByUser);

// Obtener orden por ID
router.get('/orders/:id', authMiddleware, getOrderById);

// Crear nueva orden
router.post('/orders', authMiddleware, createOrder);

// Cancelar orden (función especial)
router.patch('/orders/cancel/:id', authMiddleware, isAdministrator, cancelOrder);

// Actualizar solo el estado de la orden
router.patch('/orders/status/:id', authMiddleware, isAdministrator, updateOrderStatus);

// Actualizar solo el estado de pago
router.patch('/orders/payment-status/:id', authMiddleware, isAdministrator, updatePaymentStatus);

// Actualizar orden completa
router.put('/orders/:id', authMiddleware, isAdministrator, updateOrder);

// Eliminar orden (solo si está cancelada)
router.delete('/orders/:id', authMiddleware, isAdministrator, deleteOrder);

export default router;
