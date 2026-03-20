import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaShoppingCart } from "react-router-dom"; // Actually, let's just use regular buttons or import from exactly what's available
import { getWishlist, removeFromWishlist } from "../services/wishlistService";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { Loading, ErrorMessage, Button } from "../components/atoms";
import "./WishList.css";

export default function WishList() {
    const { toggleWishlist, wishlistItems } = useWishlist();
    const { addToCart } = useCart();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchFullProducts = async () => {
            setLoading(true);
            try {
                const fullWishlist = await getWishlist();
                if (isMounted) {
                    // Extraemos el objeto product poblado
                    setItems(fullWishlist.map((item) => item.product).filter(Boolean));
                }
            } catch (err) {
                if (isMounted) setError("No se pudo cargar tu lista de deseos.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchFullProducts();
        return () => { isMounted = false; };
    }, []);

    // Listen to global changes in the Context (if another tab removes an item)
    useEffect(() => {
        setItems((currentItems) =>
            currentItems.filter(item => wishlistItems.includes(item._id))
        );
    }, [wishlistItems]);

    const handleRemove = async (productId) => {
        // This updates the global context and triggers the effect above to remove from this list
        await toggleWishlist(productId);
    };

    const handleAddToCart = (product) => {
        addToCart({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.images && product.images.length > 0 ? product.images[0] : "",
            quantity: 1,
        });
    };

    if (loading) return <Loading message="Cargando tu lista de deseos..." />;
    if (error) return <ErrorMessage message={error} />;

    if (items.length === 0) {
        return (
            <div className="wishlist-empty">
                <h2>Tu lista de deseos está vacía</h2>
                <p>Aún no has guardado ningún producto. ¡Explora nuestro catálogo y empieza a guardar tus favoritos!</p>
                <Link to="/">
                    <Button variant="primary">Explorar Productos</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <h2>Mi Lista de Deseos</h2>
                <p>{items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}</p>
            </div>

            <div className="wishlist-grid">
                {items.map((product) => (
                    <div key={product._id} className="wishlist-item-card">
                        <Link to={`/product/${product._id}`} className="wishlist-img-link">
                            <img
                                src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/150"}
                                alt={product.name}
                                className="wishlist-item-image"
                            />
                        </Link>

                        <div className="wishlist-item-details">
                            <Link to={`/product/${product._id}`}>
                                <h3 className="wishlist-item-title">{product.name}</h3>
                            </Link>
                            <div className="wishlist-item-price">
                                ${product.price ? product.price.toFixed(2) : "0.00"}
                            </div>
                            <div className="wishlist-item-status">
                                {product.inStock > 0 ? (
                                    <span className="stock-ok">En stock</span>
                                ) : (
                                    <span className="stock-out">Agotado</span>
                                )}
                            </div>
                        </div>

                        <div className="wishlist-item-actions">
                            <Button
                                variant="primary"
                                className="btn-add-cart"
                                disabled={product.inStock <= 0}
                                onClick={() => handleAddToCart(product)}
                            >
                                Añadir al Carrito
                            </Button>
                            <Button
                                variant="danger"
                                className="btn-remove"
                                onClick={() => handleRemove(product._id)}
                            >
                                Eliminar
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
