import WishList from '../models/wishList.js';

async function getWishLists(req, res) {
  try {
    const wishLists = await WishList.find().populate('user').populate('products.product');
    res.json(wishLists);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getWishListById(req, res) {
  try {
    const id = req.params.id;
    const wishList = await WishList.findById(id).populate('user').populate('products.product');
    if (!wishList) {
      return res.status(404).json({ message: 'WishList not found' });
    }
    res.json(wishList);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getWishListByUser(req, res) {
  try {
    const userId = req.params.id;
    const wishList = await WishList.findOne({ user: userId }).populate('user').populate('products.product');
    if (!wishList) {
      return res.status(404).json({ message: 'No wishList found for this user' });
    }
    res.json(wishList);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function createWishList(req, res) {
  try {
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const newWishList = await WishList.create({
      user,
      products
    });

    await newWishList.populate('user');
    await newWishList.populate('products.product');

    res.status(201).json(newWishList);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updateWishList(req, res) {
  try {
    const { id } = req.params;
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const updatedWishList = await WishList.findByIdAndUpdate(id,
      { user, products },
      { new: true }
    ).populate('user').populate('products.product');

    if (updatedWishList) {
      return res.status(200).json(updatedWishList);
    } else {
      return res.status(404).json({ message: 'WishList not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function deleteWishList(req, res) {
  try {
    const { id } = req.params;
    const deletedWishList = await WishList.findByIdAndDelete(id);

    if (deletedWishList) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'WishList not found' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function addProductToWishList(req, res) {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ error: 'User ID, product ID, and valid quantity are required' });
    }

    // Buscar el carrito del usuario
    let wishList = await WishList.findOne({ user: userId });

    if (!wishList) {
      // Si no existe carrito, crear uno nuevo
      wishList = new WishList({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Si existe carrito, verificar si el producto ya está
      const existingProductIndex = wishList.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        wishList.products[existingProductIndex].quantity += quantity;
      } else {
        // Si el producto no existe, agregarlo
        wishList.products.push({ product: productId, quantity });
      }
    }

    await wishList.save();
    await wishList.populate('user');
    await wishList.populate('products.product');

    res.status(200).json(wishList);
  } catch (error) {
    res.status(500).send({ error });
  }
}

export {
  getWishLists,
  getWishListById,
  getWishListByUser,
  createWishList,
  updateWishList,
  deleteWishList,
  addProductToWishList,
};