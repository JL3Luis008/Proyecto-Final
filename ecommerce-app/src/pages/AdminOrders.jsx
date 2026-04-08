import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, Button, Loading, ErrorMessage } from "../components/atoms";
import { getOrders, updateOrderStatus, updatePaymentStatus, cancelOrder } from "../services/orderService";
import Swal from "sweetalert2";
import "./AdminOrders.css";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quick filters
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError("No se pudieron cargar las órdenes. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch(err) {
        Swal.fire('Error', 'No se pudo actualizar el estado de la orden', 'error');
    }
  };

  const handlePaymentStatusChange = async (orderId, currentStatus, newStatus) => {
    if (currentStatus === newStatus) return;
    
    try {
      await updatePaymentStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: newStatus } : o));
      Swal.fire({
        icon: 'success',
        title: 'Pago actualizado',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch(err) {
        Swal.fire('Error', 'No se pudo actualizar el pago', 'error');
    }
  };

  const handleCancel = async (orderId) => {
    const result = await Swal.fire({
        title: '¿Cancelar orden?',
        text: "El inventario será restaurado. Esta acción es irreversible.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await cancelOrder(orderId);
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled', paymentStatus: res.order?.paymentStatus || o.paymentStatus } : o));
             Swal.fire(
              'Cancelada',
              'La orden fue cancelada y el inventario restaurado.',
              'success'
            );
        } catch(err) {
             Swal.fire('Error', err.response?.data?.message || 'No se pudo cancelar la orden.', 'error');
        }
    }
  };

  const filteredOrders = filterStatus === "all" 
      ? orders 
      : orders.filter(o => o.status === filterStatus);

  if (loading) return <Loading message="Cargando órdenes..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="admin-orders-container">
      <div className="admin-header">
        <h1>Gestión de Órdenes</h1>
        <div className="admin-filters">
           <label>Filtrar por estado:</label>
           <select 
             value={filterStatus} 
             onChange={(e) => setFilterStatus(e.target.value)}
             className="status-filter-select"
           >
             <option value="all">Todas</option>
             <option value="pending">Pendientes</option>
             <option value="processing">Procesando</option>
             <option value="shipped">Enviadas</option>
             <option value="delivered">Entregadas</option>
             <option value="cancelled">Canceladas</option>
           </select>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-table-message">
                  No hay órdenes que coincidan con el filtro actual.
                </td>
              </tr>
            ) : (
                filteredOrders.map(order => (
                <tr key={order._id}>
                  <td className="order-id">
                    <span title={order._id}>{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    {order.user?.email || "Usuario Eliminado"}
                  </td>
                  <td className="fw-bold">${order.totalPrice.toFixed(2)}</td>
                  <td>
                     <select 
                        className={`status-select payment-${order.paymentStatus}`}
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order._id, order.paymentStatus, e.target.value)}
                        disabled={order.status === "cancelled"}
                     >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="failed">Fallido</option>
                        <option value="refunded">Reembolsado</option>
                     </select>
                  </td>
                  <td>
                      <select 
                        className={`status-select order-${order.status}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, order.status, e.target.value)}
                        disabled={order.status === "cancelled" || order.status === "delivered"}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                     </select>
                  </td>
                  <td className="actions-cell">
                    <button 
                       className="action-btn cancel-btn" 
                       onClick={() => handleCancel(order._id)}
                       title="Cancelar Orden"
                       disabled={order.status === "cancelled" || order.status === "delivered"}
                    >
                       <Icon name="xCircle" size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
