import { http } from "./http";

export const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return token !== null;
};

export const getUserProfile = async () => {
  try {
    const res = await http.get("users/profile");
    return res.data.user;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const res = await http.put("users/profile", userData);
    return res.data.user;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const res = await http.put("users/change-password", passwordData);
    return res.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// Admin functions
export const getAllUsers = async (params) => {
  try {
    const res = await http.get("users", { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const res = await http.get(`users/${userId}`);
    return res.data.user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const res = await http.put(`users/${userId}`, userData);
    return res.data.user;
  } catch (error) {
    console.error("Error updating user (admin):", error);
    throw error;
  }
};
export const uploadUserProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await http.post("users/profile/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};
