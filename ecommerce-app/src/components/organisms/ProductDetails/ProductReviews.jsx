import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { getProductReviews, addProductReview } from "../../../services/productService";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { Button, ErrorMessage, Icon, Loading } from "../../atoms";

export default function ProductReviews({ productId, setProduct }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    let ignore = false;
    const loadReviews = async () => {
      try {
        setLoading(true);
        const reviewsData = await getProductReviews(productId);
        if (!ignore) setReviews(reviewsData);
      } catch (err) {
        if (!ignore) console.error("Could not fetch reviews:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadReviews();

    return () => {
      ignore = true;
    };
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setReviewError("Debes iniciar sesión para dejar una reseña.");
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const newReview = await addProductReview(productId, {
        rating: ratingInput,
        comment: commentInput
      });

      // Update local state
      setReviews([newReview, ...reviews]);
      
      // Update product average rating dynamically in parent component
      setProduct(prev => {
        if (!prev) return prev;
        const newTotalReviews = (prev.numReviews || 0) + 1;
        const currentTotalScore = (prev.rating || 0) * (prev.numReviews || 0);
        const newRating = (currentTotalScore + ratingInput) / newTotalReviews;
        return { ...prev, rating: newRating, numReviews: newTotalReviews };
      });

      setReviewSuccess("Tu reseña ha sido publicada exitosamente.");
      setCommentInput("");
      setRatingInput(5);
    } catch (err) {
      setReviewError(err.response?.data?.message || "Ocurrió un error al enviar tu reseña.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loading message="Cargando reseñas..." />;
  }

  return (
    <>
      {/* Review Form */}
      <div className="review-form-container">
        <h3>Deja tu reseña</h3>
        {user ? (
          <form onSubmit={handleReviewSubmit} className="review-form">
            {reviewError && <ErrorMessage message={reviewError} />}
            {reviewSuccess && <div className="success-message">{reviewSuccess}</div>}
            
            <div className="form-group">
              <label>Calificación (Estrellas):</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={24}
                    className={star <= ratingInput ? "star-active" : "star-inactive"}
                    onClick={() => setRatingInput(star)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Comentario:</label>
              <textarea
                id="comment"
                className="input"
                rows="3"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="¿Qué te pareció este producto?"
                maxLength={500}
              />
            </div>

            <Button type="submit" variant="primary" loading={submittingReview}>
              Publicar Reseña
            </Button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>Debes <Link to="/login" className="text-primary font-bold">iniciar sesión</Link> para dejar una reseña en este producto.</p>
          </div>
        )}
      </div>

      {/* Existing Reviews List */}
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <img 
                    src={getProductImageUrl(review.user?.avatar) || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + review.user?._id}
                    alt={review.user?.displayName || "Usuario"}
                    className="reviewer-avatar"
                    loading="lazy"
                  />
                  <span className="reviewer-name">{review.user?.displayName || "Usuario"}</span>
                </div>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="star"
                      size={14}
                      className={i < review.rating ? "star-active" : "star-inactive"}
                    />
                  ))}
                </div>
              </div>
              {review.comment && <p className="review-comment">{review.comment}</p>}
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="muted text-center pt-normal">Aún no hay reseñas para este producto. ¡Sé el primero en calificarlo!</p>
        )}
      </div>
    </>
  );
}
