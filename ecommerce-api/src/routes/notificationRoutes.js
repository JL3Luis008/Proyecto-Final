import express from 'express';
import {
  getNotifications,
  getNotificationById,
  getNotificationByUser,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsReadByUser,
  getUnreadNotificationsByUser,
} from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import isAdministrator from '../middlewares/isAdministratorMiddleware.js';

const router = express.Router();

// Obtener todas las notificaciones (admin)
router.get('/notifications', authMiddleware, isAdministrator, getNotifications);

// Obtener notificaciones no leídas por usuario
router.get('/notifications/unread/:userId', authMiddleware, getUnreadNotificationsByUser);

// Obtener notificaciones por usuario
router.get('/notifications/user/:userId', authMiddleware, getNotificationByUser);

// Obtener notificación por ID
router.get('/notifications/:id', authMiddleware, getNotificationById);

// Crear nueva notificación
router.post('/notifications', authMiddleware, createNotification);

// Marcar una notificación como leída
router.patch('/notifications/mark-read/:id', authMiddleware, markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.patch('/notifications/user/mark-all-read/:userId', authMiddleware, markAllAsReadByUser);

// Actualizar notificación
router.put('/notifications/:id', authMiddleware, isAdministrator, updateNotification);

// Eliminar notificación
router.delete('/notifications/:id', authMiddleware, deleteNotification);

export default router;
