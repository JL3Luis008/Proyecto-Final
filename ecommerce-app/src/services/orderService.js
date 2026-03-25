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
