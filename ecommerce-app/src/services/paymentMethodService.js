import { http } from "./http";

/**
 * Obtener todos los métodos de pago del usuario autenticado.
 * GET /api/payment-methods/me
 */
export const getMyPaymentMethods = async () => {
    const response = await http.get("payment-methods/me");
    // El backend devuelve el array directamente o envuelto
    return Array.isArray(response.data) ? response.data : response.data.paymentMethods || [];
};

/**
 * Crear un nuevo método de pago.
 * POST /api/payment-methods
 * @param {Object} data - { type, cardNumber, cardHolderName, expiryDate, isDefault, ... }
 */
export const createPaymentMethod = async (data) => {
    const response = await http.post("payment-methods", data);
    return response.data.paymentMethod || response.data;
};

/**
 * Actualizar un método de pago existente.
 * PUT /api/payment-methods/:id
 */
export const updatePaymentMethod = async (id, data) => {
    const response = await http.put(`payment-methods/${id}`, data);
    return response.data.paymentMethod || response.data;
};

/**
 * Eliminar un método de pago.
 * DELETE /api/payment-methods/:id
 */
export const deletePaymentMethod = async (id) => {
    const response = await http.delete(`payment-methods/${id}`);
    return response.data;
};

/**
 * Marcar un método de pago como predeterminado.
 * PATCH /api/payment-methods/:id/set-default
 */
export const setDefaultPaymentMethod = async (id) => {
    const response = await http.patch(`payment-methods/${id}/set-default`);
    return response.data.paymentMethod || response.data;
};
