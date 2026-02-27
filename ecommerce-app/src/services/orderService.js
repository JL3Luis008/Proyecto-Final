import { http } from "./http";

export const createOrder = (async) => async (orderData) => {
  try {
    const response = await http.post("orders", orderData);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getMyOrders = async (page = 1, limit = 10) => {
  try {
    //miapi/orders/my-orders/1/10
    //miapi/orders/my-orders?page=1&limit=10
    const response = await http.get("orders/my-orders", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await http.get(`orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
