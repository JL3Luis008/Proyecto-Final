import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../context/NotificationContext";
import { Icon } from "../../components/atoms";
import "./NotificationDropdown.css";

const NotificationDropdown = () => {
  const { notifications, unreadCount, loading, handleMarkAsRead, handleMarkAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const onMarkAsRead = async (e, id) => {
    e.stopPropagation();
    await handleMarkAsRead(id);
  };

  const onMarkAllRead = async (e) => {
    e.stopPropagation();
    await handleMarkAllAsRead();
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button className="notification-btn" onClick={toggleDropdown} aria-label="Notificaciones">
        <Icon name="bell" size={24} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown-menu">
          <div className="notification-header">
            <h4>Notificaciones</h4>
            {unreadCount > 0 && (
              <button className="mark-all-read-btn" onClick={onMarkAllRead}>
                Marcar todo como leído
              </button>
            )}
          </div>
          <div className="notification-body">
            {loading ? (
              <div className="notification-empty">Cargando...</div>
            ) : notifications.length > 0 ? (
              <ul className="notification-list">
                {notifications.map((notif) => (
                  <li key={notif._id} className={`notification-item ${!notif.isRead ? "unread" : ""}`}>
                    <div className="notification-content">
                        <p>{notif.message}</p>
                        <span className="time">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    {!notif.isRead && (
                      <button 
                        className="mark-read-icon" 
                        onClick={(e) => onMarkAsRead(e, notif._id)}
                        title="Marcar como leída"
                      >
                        <Icon name="check" size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="notification-empty">
                <Icon name="bell" size={32} />
                <p>No tienes notificaciones nuevas</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
