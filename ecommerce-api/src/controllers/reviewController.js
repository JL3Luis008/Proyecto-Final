import Review from "../models/Review.js";
import Product from "../models/product.js";

export const addProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const { id: productId } = req.params;
    const userId = req.user.userId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) return res.status(400).json({ message: "Product already reviewed" });

    const review = await Review.create({
      user: userId,
      product: productId,
      rating: Number(rating),
      comment
    });

    const allReviews = await Review.find({ product: productId });
    product.numReviews = allReviews.length;
    product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const reviews = await Review.find({ product: productId }).populate("user", "displayName avatar");
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const createReview = addProductReview;

export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user.userId }).populate("product", "name imagesUrl");
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating && !comment) {
      return res.status(400).json({ message: "At least one field is required" });
    }

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (rating) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    await review.save();

    const allReviews = await Review.find({ product: review.product });
    const product = await Product.findById(review.product);
    if (product) {
      product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
      await product.save();
    }

    res.json(review);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (review.user.toString() !== req.user.userId && req.user?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden" });
    }

    const productId = review.product;
    await review.deleteOne();

    const allReviews = await Review.find({ product: productId });
    const product = await Product.findById(productId);
    if (product) {
        product.numReviews = allReviews.length;
        if (allReviews.length === 0) product.rating = 0;
        else product.rating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
        await product.save();
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
