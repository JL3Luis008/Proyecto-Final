import express from 'express';
import {
  getUsers,
  getUserById,
  getUsersByUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// Obtener todas las órdenes (admin)
router.get('/users', getUsers);

// Obtener órdenes por usuario
router.get('/users/user/:userId', getUsersByUser);

// Obtener orden por ID
router.get('/users/:id', getUserById);

// Crear nueva orden
router.post('/users', createUser);

// Actualizar orden completa
router.put('/users/:id', updateUser);

// Eliminar orden (solo si está cancelada)
router.delete('/users/:id', deleteUser);

export default router;
