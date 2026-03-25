import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import Breadcrumb from "../../../layout/Breadcrumb/Breadcrumb";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { getProductById } from "../../../services/productService";
import { Badge, Button, ErrorMessage, Icon, Loading } from "../../atoms";
import "./ProductDetails.css";

const ProductReviews = lazy(() => import("./ProductReviews"));


export default function ProductDetails({ productId }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await getProductById(productId);
        setProduct(productData);
        // Load reviews immediately
        // (Reviews are now lazy-loaded in ProductReviews component)
      } catch (error) {
        setError("Error al cargar el producto");
      }
      finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const categorySlug = product?.category?._id || product?.category?.name || null;
  const categoryName = product?.category?.name || "Categoría";


  const handleAddToCart = () => {
    if (product) addToCart(product, 1);
  };

  const nextImage = () => {
    if (!product?.imagesUrl) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.imagesUrl.length);
  };

  const prevImage = () => {
    if (!product?.imagesUrl) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.imagesUrl.length) % product.imagesUrl.length);
  };



  if (loading) {
    return (
      <div className="product-details-container">
        <Loading message="Cargando producto..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="product-details-container">
        <ErrorMessage message={error}>
          <p className="muted">
            Revisa nuestra <Link to="/">página principal</Link> o explora otras
            categorías.
          </p>
        </ErrorMessage>
      </div>
    );
  }
  if (!product) return null;

  const {
    name,
    description,
    details,
    includes,
    condition,
    region,
    price,
    stock,
    imagesUrl,
    category,
    rating,
    numReviews,
  } = product;
  const stockBadge = stock > 0 ? "success" : "error";
  const stockLabel = stock > 0 ? "En stock" : "Agotado";

  return (
    <div className="product-details-container">
      <Breadcrumb
        items={[
          { label: "Inicio", to: "/" },
          categorySlug
            ? {
              label: categoryName,
              to: `/category/${categorySlug}`,
            }
            : { label: "Categoría" },
          { label: name },
        ]}
      />
      <div className="product-details-main">
        <div className="product-details-image-section">
          <div className="product-details-image-main">
            <img
              src={getProductImageUrl(imagesUrl?.[currentImageIndex])}
              alt={name}
              onError={(event) => {
                event.target.src = "/img/products/placeholder.svg";
              }}
            />
            {imagesUrl?.length > 1 && (
              <>
                <button className="carousel-btn prev" onClick={prevImage} aria-label="Anterior">
                  <Icon name="chevronLeft" size={24} />
                </button>
                <button className="carousel-btn next" onClick={nextImage} aria-label="Siguiente">
                  <Icon name="chevronRight" size={24} />
                </button>
              </>
            )}
          </div>
          {imagesUrl?.length > 1 && (
            <div className="product-details-thumbnails">
              {imagesUrl.map((url, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={getProductImageUrl(url)} alt={`${name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="product-details-info">
          <div className="product-details-title">
            <h1 className="h1">{name}</h1>
            {categoryName !== "Categoría" && (
              <span className="product-details-category">
                {categoryName}
              </span>
            )}
          </div>

          <div className="product-details-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Icon
                  key={i}
                  name="star"
                  size={18}
                  className={i < Math.round(rating || 0) ? "star-active" : "star-inactive"}
                />
              ))}
            </div>
            <span className="rating-text">
              {rating || 0} ({numReviews || 0} reseñas)
            </span>
          </div>

          <p className="product-details-description">{description}</p>

          <div className="product-details-meta">
            <div className="meta-item">
              <span className="label">Condición:</span>
              <Badge
                text={condition === "New" ? "Nuevo" : condition}
                variant={condition === "New" ? "success" : "warning"}
              />
            </div>
            <div className="meta-item">
              <span className="label">Región:</span>
              <span>{region}</span>
            </div>
          </div>
          <div className="product-details-stock">
            <Badge text={stockLabel} variant={stockBadge} />
            {stock > 0 && (
              <span className="muted">{stock} unidades disponibles</span>
            )}
          </div>
          <div className="product-details-price">${price}</div>
          <div className="product-details-actions">
            <Button
              variant="primary"
              size="lg"
              disabled={stock === 0}
              onClick={handleAddToCart}
            >
              Agregar al carrito
            </Button>
            <Link to="/cart" className="btn btn-outline btn-lg">
              Ver carrito
            </Link>
          </div>

          <div className="product-details-extra">
            <div className="extra-section">
              <h3>¿Qué incluye?</h3>
              <p>{includes}</p>
            </div>
            <div className="extra-section">
              <h3>Especificaciones Detalladas</h3>
              <div className="details-content">
                {details?.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="product-details-reviews">
        <h2 className="reviews-title">Reseñas del Producto</h2>
        
        <Suspense fallback={<div style={{ textAlign: "center", padding: "2rem" }}><Loading message="Cargando reseñas..." /></div>}>
          <ProductReviews productId={productId} setProduct={setProduct} />
        </Suspense>
      </div>
    </div>
  );
}
