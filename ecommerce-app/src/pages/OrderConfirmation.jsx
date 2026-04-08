import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon, Loading, ErrorMessage } from "../components/atoms";

import { useCart } from "../context/CartContext";
import { getOrderById } from "../services/orderService";
import "./OrderConfirmation.css";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(location.state?.order || null);
  const [isLoading, setIsLoading] = useState(!location.state?.order);
  const [fetchError, setFetchError] = useState(null);

  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    // Si ya tenemos orden y ya cargamos:
    if (order && !isLoading) {
      if (!clearedRef.current) {
        try { clearCart(); } catch (e) {}
        clearedRef.current = true;
      }
      return;
    }

    if (!order && id) {
      const fetchOrder = async () => {
        try {
          const data = await getOrderById(id);
          setOrder(data);
        } catch (err) {
          setFetchError("No se pudo cargar la orden. Verifica el enlace o intenta desde tu perfil.");
        } finally {
          setIsLoading(false);
          if (!clearedRef.current) {
             try { clearCart(); } catch (e) {}
             clearedRef.current = true;
          }
        }
      };
      fetchOrder();
    } else if (!order && !id) {
       navigate("/");
    }
  }, [id, order, navigate, clearCart, isLoading]);

  if (isLoading) return <Loading message="Cargando detalles de tu compra..." />;
  if (fetchError) return <div className="order-confirmation" style={{marginTop: "5rem"}}><ErrorMessage message={fetchError} /><Link to="/orders" className="button secondary mt-4">Ver mis pedidos</Link></div>;
  if (!order) return null;

  // Formatear la fecha para mostrarla
  const orderDate = order.date
    ? new Date(order.date).toLocaleDateString()
    : "No disponible";

  // Formatear el total con Intl.NumberFormat para mejor formato de moneda
  const money = (v) =>
    typeof v === "number"
      ? new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
      }).format(v)
      : "$0.00";

  const address = order.shippingAddress || {};
  const subtotal = order.subtotal ?? 0;
  const tax = order.tax ?? 0;
  const shipping = order.shipping ?? 0;
  const total = order.total ?? subtotal + tax + shipping;

  return (
    <div className="order-confirmation">
      <div className="confirmation-content">
        <div className="confirmation-icon">
          <Icon name="checkCircle" size={64} className="success" />
        </div>
        <h1>¡Gracias por tu compra!</h1>
        <p className="confirmation-message">
          Tu pedido #{order.id || "N/A"} ha sido confirmado y está siendo
          procesado.
        </p>
        <div className="confirmation-details">
          <h2>Detalles de tu pedido:</h2>
          <div className="order-info">
            <p>
              <strong>Fecha:</strong> {orderDate}
            </p>

            <h3>Productos</h3>
            <ul className="order-items">
              {(order.items || []).map((it) => (
                <li key={it._id || it.id || it.name}>
                  {it.name} x{it.quantity} — {money(it.price)}
                  <span className="item-subtotal">{money(it.subtotal)}</span>
                </li>
              ))}
            </ul>

            <div className="order-totals">
              <p>
                <strong>Subtotal:</strong> {money(subtotal)}
              </p>
              <p>
                <strong>IVA:</strong> {money(tax)}
              </p>
              <p>
                <strong>Envío:</strong>{" "}
                {shipping === 0 ? "Gratis" : money(shipping)}
              </p>
              <hr />
              <p>
                <strong>Total:</strong> {money(total)}
              </p>

              <p>
                <strong>Dirección de envío:</strong>
              </p>
              <address>
                {address.name || "No disponible"}
                <br />
                {address.address1 || ""}
                {address.address1 && <br />}
                {address.address2 || ""}
                {address.address2 && <br />}
                {address.city && address.postalCode
                  ? `${address.city}, ${address.postalCode}`
                  : "Ciudad y código postal no disponibles"}
                <br />
                {address.country || "País no especificado"}
              </address>
            </div>
          </div>
          <p>
            Hemos enviado un correo electrónico con los detalles de tu compra.
            También puedes ver el estado de tu pedido en cualquier momento desde
            tu perfil.
          </p>
        </div>
        <div className="confirmation-actions">
          <Link to="/" className="button primary">
            <Icon name="home" size={20} />
            <span>Volver al inicio</span>
          </Link>
          <Link to="/orders" className="button secondary">
            <Icon name="package" size={20} />
            <span>Ver mis pedidos</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
