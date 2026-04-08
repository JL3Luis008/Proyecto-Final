import { http } from "./http";

export const getUnreadNotifications = async (userId) => {
    try {
        const response = await http.get(`notifications/unread/${userId}`);
        return response.data; // { count, notifications }
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        throw error;
    }
};

export const getAllMyNotifications = async (userId) => {
    try {
        const response = await http.get(`notifications/user/${userId}`);
        return response.data; // Array of notifications
    } catch (error) {
        console.error("Error fetching all notifications:", error);
        throw error;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const response = await http.patch(`notifications/${notificationId}/mark-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
};

export const markAllAsRead = async (userId) => {
    try {
        const response = await http.patch(`notifications/user/${userId}/mark-all-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
};
