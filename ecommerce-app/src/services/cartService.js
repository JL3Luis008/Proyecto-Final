import { http } from "./http";

export const getCart = async (userId) => {
  try {
    const response = await http.get(`cart/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching a cart", error);
    throw error;
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    const response = await http.post("/cart/add-product", {
      userId,
      productId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding a cart", error);
    throw error;
  }
};

export const updateCartItem = async (userId, productId, quantity) => {
  try {
    const response = await http.put("/cart/update-item", {
      userId,
      productId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeToCart = async (userId, productId) => {
  try {
    // Note: The API expect userId in the body for the delete request.
    const response = await http.delete(`/cart/remove-item/${productId}`, {
      data: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing product from cart:", error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const response = await http.post("/cart/clear", { userId });
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
