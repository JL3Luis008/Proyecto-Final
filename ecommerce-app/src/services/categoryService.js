import { http } from "./http";

export const fetchCategories = async () => {
  try {
    const response = await http.get("categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await http.get("categories/search", { params: { q: query } });
    return response.data; // This returns { categories, pagination, ... }
  } catch (error) {
    console.error("Error searching categories:", error);
    return { categories: [] };
  }
};

export const getCategoryById = async (categoryId) => {
  try {
    const response = await http.get(`categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return null;
  }
};

// Obtener todas las categorías hijas de una categoría padre
export const getChildCategories = async (parentCategoryId) => {
  try {
    const response = await http.get("categories/search", { params: { parentCategory: parentCategoryId } });
    return response.data.categories;
  } catch (error) {
    console.error("Error fetching child categories:", error);
    return [];
  }
};

// Obtener categorías principales (sin padre)
export const getParentCategories = async () => {
  try {
    const categories = await fetchCategories();
    return categories.filter((cat) => !cat.parentCategory);
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    return [];
  }
};

// Admin Endpoints
export const createCategory = async (categoryData) => {
  try {
    const response = await http.post("categories", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await http.put(`categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const response = await http.delete(`categories/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

