import Review from '../models/review.js';
import Product from '../models/product.js';

// Get reviews for a product
export async function getProductReviews(req, res, next) {
  try {
    const { id } = req.params; // Product ID
    const reviews = await Review.find({ product: id })
      .populate('user', 'displayName avatar')
      .sort({ _id: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
}

// Add a review to a product
export async function addProductReview(req, res, next) {
  try {
    const { id } = req.params; // Product ID
    const { rating, comment } = req.body;
    const userId = req.user.userId; // From authMiddleware

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    // Check if the user already reviewed this product
    const existingReview = await Review.findOne({ product: id, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'Ya has calificado este producto.' });
    }

    // Create the review
    const newReview = await Review.create({
      user: userId,
      product: id,
      rating: Number(rating),
      comment
    });

    // Update Product average rating and number of reviews
    const allReviews = await Review.find({ product: id });
    const numReviews = allReviews.length;
    const totalRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
    product.rating = totalRating / numReviews;
    product.numReviews = numReviews;

    await product.save();

    // Populate user details before sending back the response
    await newReview.populate('user', 'displayName avatar');

    res.status(201).json(newReview);
  } catch (error) {
    next(error);
  }
}

// Alias to satisfy reviewRoutes.js expected import
export const createReview = addProductReview;

// Stubs for other routes defined in reviewRoutes.js
export async function deleteReview(req, res, next) {
  res.status(501).json({ message: "Not implemented" });
}

export async function getUserReviews(req, res, next) {
  res.status(501).json({ message: "Not implemented" });
}

export async function updateReview(req, res, next) {
  res.status(501).json({ message: "Not implemented" });
}
