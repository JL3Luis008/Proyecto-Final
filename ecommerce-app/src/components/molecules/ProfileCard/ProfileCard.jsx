import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../atoms";
import { getProductImageUrl } from "../../../utils/imageUtils";

import "./ProfileCard.css";

const ROLE_COLORS = {
  admin: "#2563eb",
  customer: "#22c55e",
};

export default function ProfileCard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  const role = user.role || "guest";

  const roleActions = {
    admin: [
      { label: "Configuración de Cuenta", action: () => { navigate("/settings"); } },
      { label: "Gestión de Productos", action: () => { navigate("/admin/products"); } },
      { label: "Gestión de Órdenes", action: () => { navigate("/admin/orders"); } },
      { label: "Gestión de Categorías", action: () => { navigate("/admin/categories"); } },
      { label: "Gestión de Usuarios", action: () => { navigate("/admin/users"); } },
    ],
    customer: [
      { label: "Configuración de Cuenta", action: () => { navigate("/settings"); } },
      { label: "Ver mis pedidos", action: () => { navigate("/orders"); } },
    ],
  };

  const actions = roleActions[role] || [];

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-container">
            <img
              src={getProductImageUrl(user.avatar) || "/img/user-placeholder.png"}
              alt={user.displayName || user.email}
              className="profile-avatar"
            />
          </div>
          <div className="profile-names">
            <h2>{user.displayName || user.email}</h2>
            <span className={`profile-role-badge role-${role}`}>
              {role}
            </span>
          </div>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Email:</label>
            <span>{user.email || "No disponible"}</span>
          </div>
          <div className="info-item">
            <label>Nombre:</label>
            <span>{user.displayName || "No disponible"}</span>
          </div>
          {user.phone && (
            <div className="info-item">
              <label>Teléfono:</label>
              <span>{user.phone}</span>
            </div>
          )}
          <div className="info-item">
            <label>Estado:</label>
            <span>{user.isActive ? "Activo" : "Inactivo"}</span>
          </div>
          <div className="info-item">
            <label>Última conexión:</label>
            <span>
              {user.loginDate
                ? new Date(user.loginDate).toLocaleString()
                : "No disponible"}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <h3>Acciones de la cuenta</h3>
          <div className="actions-grid">
            {actions.map((action, idx) => (
              <Button key={idx} type="button" onClick={action.action} variant={idx === 0 ? "primary" : "secondary"}>
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
