import { http } from "./http";

export const createOrder = async (orderData) => {
  const response = await http.post("orders", orderData);
  return response.data;
};

/**
 * Obtener las órdenes del usuario autenticado.
 * GET /api/orders/me
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Resultados por página (default: 20)
 * @returns {{ orders: Order[], pagination: { total, page, limit, totalPages } }}
 */
export const getMyOrders = async (page = 1, limit = 20) => {
  try {
    const response = await http.get("orders/me", { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return { orders: [], pagination: {} };
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await http.get(`orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return null;
  }
};

// Admin Endpoints
export const getOrders = async () => {
  try {
    const response = await http.get("orders");
    return response.data;
  } catch (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await http.patch(`orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const response = await http.patch(`orders/${orderId}/payment-status`, { paymentStatus });
    return response.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await http.patch(`orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Error cancelling order:", error);
    throw error;
  }
};
