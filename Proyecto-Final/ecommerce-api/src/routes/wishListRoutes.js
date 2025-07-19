const router = express.Router();

// Obtener todos los carritos (admin)
router.get('/wishList', getWishLists);

// Obtener carrito por ID
router.get('/wishList/:id', getWishListById);

// Obtener carrito por usuario
router.get('/wishList/user/:id', getWishListByUser);

// Crear nuevo carrito
router.post('/wishList', createWishList);

// Agregar producto al carrito (función especial)
router.post('/wishList/add-product', addProductToWishList);

// Actualizar carrito completo
router.put('/wishList/:id', updateWishList);

// Eliminar carrito
router.delete('/wishList/:id', deleteWishList);

export default router;
