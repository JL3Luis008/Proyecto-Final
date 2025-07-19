import ShippingAddress from '../models/shippingAddress.js';

async function getShippingAddresss(req, res) {
  try {
    const shippingAddresss = await ShippingAddress.find().populate('user').populate('products.product');
    res.json(shippingAddresss);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getShippingAddressById(req, res) {
  try {
    const id = req.params.id;
    const shippingAddress = await ShippingAddress.findById(id).populate('user').populate('products.product');
    if (!shippingAddress) {
      return res.status(404).json({ message: 'ShippingAddress not found' });
    }
    res.json(shippingAddress);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function getShippingAddressByUser(req, res) {
  try {
    const userId = req.params.id;
    const shippingAddress = await ShippingAddress.findOne({ user: userId }).populate('user').populate('products.product');
    if (!shippingAddress) {
      return res.status(404).json({ message: 'No shippingAddress found for this user' });
    }
    res.json(shippingAddress);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function createShippingAddress(req, res) {
  try {
    const { user, name, address, city, state, postalCode, country, Phone, isDefault, addressType } = req.body;
    if (!user ||!name || !address || !city || !state || !postalCode || !country || !Phone || !isDefault || !addressType) {
      return res.status(400).json({ error: 'all parameters array are required' });
    }


    const newShippingAddress = await ShippingAddress.create({
      user,
      products
    });

    await newShippingAddress.populate('user');
    await newShippingAddress.populate('products.product');

    res.status(201).json(newShippingAddress);
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function updateShippingAddress(req, res) {
  try {
    const { id } = req.params;
    const { user, name, address, city, state, postalCode, country, Phone, isDefault, addressType } = req.body;
    if (!user ||!name || !address || !city || !state || !postalCode || !country || !Phone || !isDefault || !addressType) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    const updatedShippingAddress = await ShippingAddress.findByIdAndUpdate(id,
      {user, name, address, city, state, postalCode, country, Phone, isDefault, addressType },
      { new: true }
    ).populate('user').populate('products.product');

    if (updatedShippingAddress) {
      return res.status(200).json(updatedShippingAddress);
    } else {
      return res.status(404).json({ message: 'ShippingAddress not found' });
    }
  } catch (error) {
    res.status(500).send({ error });
  }
}

async function deleteShippingAddress(req, res) {
  try {
    const { id } = req.params;
    const deletedShippingAddress = await ShippingAddress.findByIdAndDelete(id);

    if (deletedShippingAddress) {
      return res.status(204).send();
    } else {
      return res.status(404).json({ message: 'ShippingAddress not found' });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
}

async function addProductToShippingAddress(req, res) {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ error: 'User ID, product ID, and valid quantity are required' });
    }

    // Buscar el carrito del usuario
    let shippingAddress = await ShippingAddress.findOne({ user: userId });

    if (!shippingAddress) {
      // Si no existe carrito, crear uno nuevo
      shippingAddress = new ShippingAddress({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Si existe carrito, verificar si el producto ya está
      const existingProductIndex = shippingAddress.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        shippingAddress.products[existingProductIndex].quantity += quantity;
      } else {
        // Si el producto no existe, agregarlo
        shippingAddress.products.push({ product: productId, quantity });
      }
    }

    await shippingAddress.save();
    await shippingAddress.populate('user');
    await shippingAddress.populate('products.product');

    res.status(200).json(shippingAddress);
  } catch (error) {
    res.status(500).send({ error });
  }
}

export {
  getShippingAddresss,
  getShippingAddressById,
  getShippingAddressByUser,
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  addProductToShippingAddress,
};