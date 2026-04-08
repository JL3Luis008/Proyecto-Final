import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getUnreadNotifications, markAsRead, markAllAsRead } from "../services/notificationService";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { isAuth, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!isAuth || !user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        setLoading(true);
        try {
            // Fetch only unread for the badge, or fetch all and filter?
            // The unread endpoint returns `{ count, notifications }`
            const data = await getUnreadNotifications(user._id || user.id);
            setNotifications(data.notifications || []);
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        if (isAuth && user) {
            fetchNotifications();
            // Optional: Set up a polling interval for notifications
            // const intervalId = setInterval(() => { if(isMounted) fetchNotifications() }, 60000);
            // return () => { isMounted = false; clearInterval(intervalId); }
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }

        return () => {
            isMounted = false;
        };
    }, [isAuth, user]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
            return { success: true };
        } catch (error) {
            console.error("Error marking notification as read:", error);
            return { success: false, error: error.message };
        }
    };

    const handleMarkAllAsRead = async () => {
        if (!user) return;
        try {
            await markAllAsRead(user._id || user.id);
            setNotifications([]);
            setUnreadCount(0);
            return { success: true };
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
