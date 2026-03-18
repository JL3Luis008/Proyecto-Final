import { http } from "./http";

/**
 * Obtener todas las direcciones del usuario autenticado.
 * GET /api/shipping-address
 */
export const getMyAddresses = async () => {
    const response = await http.get("shipping-address");
    // El backend devuelve { message, count, addresses }
    return response.data.addresses || [];
};

/**
 * Crear una nueva dirección de envío.
 * POST /api/shipping-address
 * @param {Object} data - { name, address, city, state, postalCode, country, phone, isDefault, addressType }
 */
export const createAddress = async (data) => {
    const response = await http.post("shipping-address", data);
    return response.data.address;
};

/**
 * Actualizar una dirección existente.
 * PUT /api/shipping-address/:addressId
 */
export const updateAddress = async (addressId, data) => {
    const response = await http.put(`shipping-address/${addressId}`, data);
    return response.data.address;
};

/**
 * Eliminar una dirección.
 * DELETE /api/shipping-address/:addressId
 */
export const deleteAddress = async (addressId) => {
    const response = await http.delete(`shipping-address/${addressId}`);
    return response.data;
};

/**
 * Marcar una dirección como predeterminada.
 * PATCH /api/shipping-address/:addressId/default
 */
export const setDefaultAddress = async (addressId) => {
    const response = await http.patch(`shipping-address/${addressId}/default`);
    return response.data.address;
};
