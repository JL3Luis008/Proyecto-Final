import { http } from "./http";

/**
 * Obtener la wishlist del usuario autenticado (con los productos expandidos)
 * GET /api/wishList
 */
export const getWishlist = async () => {
    const response = await http.get("wishList");
    return response.data.wishList?.products || [];
};

/**
 * Agregar un producto a la wishlist
 * POST /api/wishList/add
 * @param {string} productId 
 */
export const addToWishlist = async (productId) => {
    const response = await http.post("wishList/add", { productId });
    return response.data;
};

/**
 * Remover un producto de la wishlist
 * DELETE /api/wishList/remove/:productId
 * @param {string} productId 
 */
export const removeFromWishlist = async (productId) => {
    const response = await http.delete(`wishList/remove/${productId}`);
    return response.data;
};

/**
 * Verificar si un producto está en la wishlist
 * GET /api/wishList/check/:productId
 * @param {string} productId 
 */
export const checkInWishlist = async (productId) => {
    const response = await http.get(`wishList/check/${productId}`);
    return response.data.inWishList;
};
