import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../../context/CartContext";
import Breadcrumb from "../../../layout/Breadcrumb/Breadcrumb";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { getProductById } from "../../../services/productService";
import { Badge, Button, ErrorMessage, Loading } from "../../atoms";

import "./ProductDetails.css";


export default function ProductDetails({ productId }) {
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await getProductById(productId);
        setProduct(productData);
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

  const { name, description, price, stock, imagesUrl, category } = product;
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
        <div className="product-details-image">
          <img
            src={getProductImageUrl(imagesUrl?.[0])}
            alt={name}
            onError={(event) => {
              event.target.src = "/img/products/placeholder.svg";
            }}
          />
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

          <p className="product-details-description">{description}</p>
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
        </div>
      </div>
    </div>
  );
}
