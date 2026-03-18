import { http } from "./http";

export const getProducts = async (page = 1, limit = 10) => {
  try {
    const response = await http.get("products", { params: { page, limit } });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], pagination: {} };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await http.get(`products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
};

export const searchProducts = async (params) => {
  try {
    const response = await http.get("products/search", { params });
    return response.data;
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], pagination: {} };
  }
};

export const getProductsByCategoryId = async (categoryId, page = 1, limit = 10) => {
  try {
    // We use searchProducts with category filter to get pagination
    return searchProducts({ category: categoryId, page, limit });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return { products: [], pagination: {} };
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await http.post("products", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await http.put(`products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await http.delete(`products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

export const uploadProductImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    const response = await http.post("products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

