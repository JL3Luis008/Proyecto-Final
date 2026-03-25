import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Icon, Loading } from "../components/atoms";
import { getMyOrders } from "../services/orderService";
import "./Orders.css";

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);

const formatDate = (isoString) => {
  if (!isoString) return "Fecha desconocida";
  try {
    return new Date(isoString).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Fecha inválida";
  }
};

/**
 * Normaliza una orden del backend al formato que espera la UI.
 * BE devuelve: { _id, totalPrice, createdAt, status, products[], shippingAddress, paymentMethod }
 */
function normalizeOrder(order) {
  const items = (order.products || []).map((p) => {
    const product = p.productId || {};
    return {
      id: p._id || product._id,
      name: product.name || "Producto",
      quantity: p.quantity || 1,
      price: p.price || product.price || 0,
      subtotal: (p.price || product.price || 0) * (p.quantity || 1),
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const shippingCost = order.shippingCost ?? 0;
  const total = typeof order.totalPrice === "number" ? order.totalPrice : subtotal + shippingCost;

  // Normalizar dirección de envío
  const rawAddr = order.shippingAddress || {};
  const shippingAddress = rawAddr._id
    ? {
        name: rawAddr.name || "",
        address1: rawAddr.address || rawAddr.address1 || "",
        address2: rawAddr.address2 || "",
        city: rawAddr.city || "",
        postalCode: rawAddr.postalCode || "",
        country: rawAddr.country || "",
      }
    : null;

  // Normalizar método de pago
  const rawPay = order.paymentMethod || {};
  const paymentMethod = rawPay._id
    ? {
        alias: rawPay.type || "Tarjeta",
        cardNumber: rawPay.cardNumber || "",
      }
    : null;

  return {
    id: order._id,
    status: order.status || "pending",
    date: order.createdAt,
    items,
    subtotal,
    shipping: shippingCost,
    tax: 0,
    total,
    shippingAddress,
    paymentMethod,
  };
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyOrders(1, 50);
        if (!isMounted) return;

        const normalized = (data?.orders || []).map(normalizeOrder);
        setOrders(normalized);
        setSelectedOrderId(normalized[0]?.id ?? null);
      } catch (err) {
        if (isMounted) {
          setError("No se pudo cargar el historial de pedidos.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrders();
    return () => { isMounted = false; };
  }, []);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const detailStatusToken = selectedOrder
    ? (selectedOrder.status || "pending").toLowerCase()
    : "pending";
  const detailStatusLabel = selectedOrder?.status || "Pendiente";

  if (loading) {
    return (
      <div className="orders-page">
        <Loading message="Cargando tus pedidos..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page orders-empty">
        <Icon name="alertCircle" size={48} />
        <h1>Error al cargar pedidos</h1>
        <p>{error}</p>
        <Link to="/" className="orders-link">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="orders-page orders-empty">
        <Icon name="package" size={48} />
        <h1>No tienes pedidos aún</h1>
        <p>
          Cuando realices tu primera compra, podrás ver el historial de tus
          pedidos aquí.
        </p>
        <Link to="/" className="orders-link">
          <Button>Descubrir productos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <p className="eyebrow">Historial de compras</p>
          <h1>Mis pedidos</h1>
          <p className="muted">
            {orders.length === 1
              ? "Tienes 1 pedido"
              : `Tienes ${orders.length} pedidos`}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => setSelectedOrderId(orders[0]?.id ?? null)}
        >
          Ver más reciente
        </Button>
      </div>

      <div className="orders-content">
        <div className="orders-list card">
          <div className="orders-list-header">
            <h2>Pedidos</h2>
            <span>{orders.length}</span>
          </div>
          <div className="orders-list-body">
            {orders.map((order) => {
              const itemCount = order.items?.length || 0;
              const statusToken = (order.status || "pending").toLowerCase();
              const isActive = selectedOrderId === order.id;
              return (
                <button
                  key={order.id}
                  className={`order-card${isActive ? " active" : ""}`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="order-card-head">
                    <span className="order-id">#{order.id?.slice(-8)}</span>
                    <span className={`order-status order-status-${statusToken}`}>
                      {order.status || "Pendiente"}
                    </span>
                  </div>
                  <p className="order-date">{formatDate(order.date)}</p>
                  <div className="order-card-meta">
                    <span>{itemCount} artículos</span>
                    <strong>{formatMoney(order.total || 0)}</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="orders-detail card">
          {selectedOrder ? (
            <>
              <div className="order-detail-header">
                <div>
                  <p className="eyebrow">Pedido #{selectedOrder.id?.slice(-8)}</p>
                  <h2>{formatMoney(selectedOrder.total || 0)}</h2>
                  <p className="muted">{formatDate(selectedOrder.date)}</p>
                </div>
                <span className={`order-status order-status-${detailStatusToken}`}>
                  {detailStatusLabel}
                </span>
              </div>

              <div className="order-section">
                <h3>Resumen del pago</h3>
                <ul className="order-summary-list">
                  <li>
                    <span>Subtotal</span>
                    <strong>{formatMoney(selectedOrder.subtotal || 0)}</strong>
                  </li>
                  <li>
                    <span>Envío</span>
                    <strong>
                      {selectedOrder.shipping === 0
                        ? "Gratis"
                        : formatMoney(selectedOrder.shipping || 0)}
                    </strong>
                  </li>
                  <li className="order-summary-total">
                    <span>Total</span>
                    <strong>{formatMoney(selectedOrder.total || 0)}</strong>
                  </li>
                </ul>
              </div>

              <div className="order-section">
                <h3>Dirección de envío</h3>
                {selectedOrder.shippingAddress ? (
                  <address className="order-address">
                    <strong>{selectedOrder.shippingAddress.name}</strong>
                    <p>{selectedOrder.shippingAddress.address1}</p>
                    {selectedOrder.shippingAddress.address2 && (
                      <p>{selectedOrder.shippingAddress.address2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.postalCode}
                    </p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </address>
                ) : (
                  <p className="muted">Sin dirección registrada.</p>
                )}
              </div>

              <div className="order-section">
                <h3>Método de pago</h3>
                {selectedOrder.paymentMethod ? (
                  <div>
                    <p>{selectedOrder.paymentMethod.alias}</p>
                    {selectedOrder.paymentMethod.cardNumber && (
                      <p>**** {selectedOrder.paymentMethod.cardNumber.slice(-4)}</p>
                    )}
                  </div>
                ) : (
                  <p className="muted">Sin método de pago registrado.</p>
                )}
              </div>

              <div className="order-section">
                <h3>Productos</h3>
                <ul className="order-items">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={item.id || index}>
                      <div>
                        <p>{item.name}</p>
                        <span>
                          Cantidad: {item.quantity} · Precio:{" "}
                          {formatMoney(item.price || 0)}
                        </span>
                      </div>
                      <strong>{formatMoney(item.subtotal || 0)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="orders-empty">
              <h3>Selecciona un pedido de la lista</h3>
              <p className="muted">
                Aquí verás el detalle completo: productos, dirección y método de
                pago utilizados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
