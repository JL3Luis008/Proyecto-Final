import Product from "../models/product.js";
import Review from "../models/review.js";

// Crear una nueva review
const createReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    const user = req.user.userId;

    // Verificar que el producto existe
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Verificar que el usuario no haya review este producto antes
    const existingReview = await Review.findOne({ user, product });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const newReview = new Review({
      user,
      product,
      rating,
      comment,
    });

    await newReview.save();

    // Poblar la respuesta con datos del usuario
    await newReview.populate("user", "displayName");

    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las reviews de un producto
const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "displayName avatar")
      .sort({ _id: -1 }); // Más recientes primero

    res.status(200).json({
      message: "Reviews retrieved successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las reviews de un usuario
const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const reviews = await Review.find({ user: userId })
      .populate("product", "name price")
      .sort({ _id: -1 });

    res.status(200).json({
      message: "User reviews retrieved successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Validar que al menos un campo esté presente
    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        message: "At least one field (rating or comment) must be provided",
      });
    }

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized" });
    }

    // Actualizar solo los campos proporcionados
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();
    await review.populate("user", "displayName");

    res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una review
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: "Review not found or unauthorized" });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { createReview, deleteReview, getProductReviews, getUserReviews, updateReview };
