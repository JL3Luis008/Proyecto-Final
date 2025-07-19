const router = express.Router();

// Obtener todos los carritos (admin)
router.get('/shippingAddress', getShippingAddress);

// Obtener carrito por ID
router.get('/shippingAddress/:id', getShippingAddressById);

// Obtener carrito por usuario
router.get('/shippingAddressshippingAddress/user/:id', getShippingAddressByUser);

// Crear nuevo carrito
router.post('/shippingAddress', createShippingAddress);

// Agregar producto al carrito (función especial)
router.post('/shippingAddress/add-product', addProductToShippingAddress);

// Actualizar carrito completo
router.put('/shippingAddress/:id', updateShippingAddress);

// Eliminar carrito
router.delete('/shippingAddress/:id', deleteShippingAddress);

export default router;
