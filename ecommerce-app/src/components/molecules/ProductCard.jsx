import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";
import { Badge, Button } from "../atoms";
import { getProductImageUrl } from "../../utils/imageUtils";

import "./ProductCard.css";

export default function ProductCard({ product, orientation = "vertical" }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuth } = useAuth();
  const { name, price, stock, imagesUrl, description, _id } = product || {};

  if (!product) {
    return (
      <div className="product-card product-card--empty">
        <p className="muted">Producto no disponible</p>
      </div>
    );
  }

  const stockBadge =
    stock > 0
      ? { text: "En stock", variant: "success" }
      : { text: "Agotado", variant: "error" };
  const hasDiscount = product.discount && product.discount > 0;
  const handleAddToCart = () => addToCart(product, 1);
  const handleToggleWishlist = async (e) => {
    e.preventDefault(); // Prevent navigating to product details
    if (!isAuth) {
      alert("Debes iniciar sesión para usar la lista de deseos");
      return;
    }
    await toggleWishlist(_id);
  };

  const productLink = `/product/${product._id}`;
  const cardClass = `product-card product-card--${orientation}`;
  const inWishlist = isInWishlist(_id);

  return (
    <div className={cardClass}>
      <Link to={productLink} className="product-card-image-link">
        <img
          src={getProductImageUrl(imagesUrl?.[0])}
          alt={name}
          className="product-card-image"
          onError={(event) => {
            event.target.src = "/img/products/placeholder.svg";
          }}
        />
        <button
          className={`wishlist-toggle-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleToggleWishlist}
          title={inWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
          aria-label="Toggle wishlist"
        >
          {inWishlist ? "❤️" : "🤍"}
        </button>
      </Link>
      <div className="product-card-content">
        <h3 className="product-card-title">
          <Link to={productLink}>
            {name}
          </Link>
        </h3>
        {description && (
          <p className="product-card-description muted">
            {description}
          </p>
        )}
        <div className="product-card-price">${price}</div>
      </div>
      <div className="product-card-actions">
        <div className="product-card-badge-container">
          <Badge text={stockBadge.text} variant={stockBadge.variant} />
          {hasDiscount && (
            <Badge text={`-${product.discount}%`} variant="warning" />
          )}
        </div>
        <Button
          variant="primary"
          size="sm"
          disabled={stock === 0}
          onClick={handleAddToCart}
        >
          Agregar al carrito
        </Button>
      </div>
    </div>
  );
}
