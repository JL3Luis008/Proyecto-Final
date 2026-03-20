import Cart from "../models/cart.js";

// Solo Admin: Ver todos los carritos
async function getCarts(req, res, next) {
  try {
    const carts = await Cart.find()
      .populate("user", "displayName email")
      .populate("products.product");
    res.json(carts);
  } catch (error) {
    next(error);
  }
}

async function getCartById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const cart = await Cart.findById(id)
      .populate("user", "displayName email")
      .populate("products.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Security Check: Only admin or owner
    if (userRole !== "admin" && cart.user._id.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. This cart does not belong to you." });
    }

    res.json(cart);
  } catch (error) {
    next(error);
  }
}

// Obtener carrito del usuario autenticado
async function getCartByUser(req, res, next) {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId })
      .populate("user", "displayName email")
      .populate("products.product");

    if (!cart) {
      return res.status(200).json({
        message: "No cart found for this user",
        cart: { user: userId, products: [] },
      });
    }
    res.json({ message: "Cart retrieved successfully", cart });
  } catch (error) {
    next(error);
  }
}

async function createCart(req, res, next) {
  try {
    const userId = req.user.userId;
    const { products } = req.body;

    // Verificar si ya tiene uno
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      return res.status(400).json({ message: "Cart already exists for this user. Use update instead." });
    }

    const newCart = await Cart.create({ user: userId, products });
    await newCart.populate("user", "displayName email");
    await newCart.populate("products.product");

    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
}

async function updateCart(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { products } = req.body;

    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Security Check: Only admin or owner
    if (userRole !== "admin" && cart.user.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. You can only update your own cart." });
    }

    if (products !== undefined) cart.products = products;

    await cart.save();
    await cart.populate("user", "displayName email");
    await cart.populate("products.product");

    res.status(200).json(cart);
  } catch (error) {
    next(error);
  }
}

async function deleteCart(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const cart = await Cart.findById(id);
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Security Check: Only admin or owner
    if (userRole !== "admin" && cart.user.toString() !== userId) {
      return res.status(403).json({ message: "Access denied. You can only delete your own cart." });
    }

    await Cart.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function addProductToCart(req, res, next) {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }],
      });
    } else {
      const existingProductIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId,
      );

      if (existingProductIndex >= 0) {
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate("user", "displayName email");
    await cart.populate("products.product");

    res.status(200).json({
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in Cart" });
    }

    cart.products[productIndex].quantity = quantity;

    await cart.save();
    await cart.populate("user", "displayName email");
    await cart.populate("products.product");

    res.json({ message: "Cart item updated", cart });
  } catch (error) {
    next(error);
  }
}

async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId,
    );

    await cart.save();
    await cart.populate("user", "displayName email");
    await cart.populate("products.product");

    res.json({ message: "Product removed from cart", cart });
  } catch (error) {
    next(error);
  }
}

async function clearCartItems(req, res, next) {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();
    await cart.populate("user", "displayName email");

    res.json({ message: "Cart cleared successfully", cart });
  } catch (error) {
    next(error);
  }
}

export {
  addProductToCart,
  createCart,
  deleteCart,
  getCartById,
  getCartByUser,
  getCarts,
  updateCart,
  updateCartItem,
  removeCartItem,
  clearCartItems,
};
