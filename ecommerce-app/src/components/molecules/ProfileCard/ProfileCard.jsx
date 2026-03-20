import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button, Input } from "../../atoms";
import { getProductImageUrl } from "../../../utils/imageUtils";

import "./ProfileCard.css";

const ROLE_COLORS = {
  admin: "#2563eb",
  customer: "#22c55e",
};

export default function ProfileCard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { user, updateProfile, updatePassword, uploadAvatar } = useAuth();


  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!user) return null;

  const role = user.role || "guest";

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        setFormData((prev) => ({ ...prev, avatar: result.imageUrl }));
        setMessage({ type: "success", text: "Imagen cargada. Guarda los cambios para aplicar." });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al subir la imagen" });
    } finally {
      setLoading(false);
    }
  };

  const onUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Perfil actualizado correctamente" });
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al actualizar el perfil" });
    } finally {
      setLoading(false);
    }
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      if (result.success) {
        setMessage({ type: "success", text: "Contraseña cambiada correctamente" });
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al cambiar la contraseña" });
    } finally {
      setLoading(false);
    }
  };

  const roleActions = {
    admin: [
      { label: "Editar Perfil", action: () => { setIsEditing(true); setIsChangingPassword(false); setMessage(null); } },
      { label: "Cambiar contraseña", action: () => { setIsChangingPassword(true); setIsEditing(false); setMessage(null); } },
      { label: "Gestión de Productos", action: () => { navigate("/admin/products"); } },
    ],
    customer: [
      { label: "Editar Perfil", action: () => { setIsEditing(true); setIsChangingPassword(false); setMessage(null); } },
      { label: "Cambiar contraseña", action: () => { setIsChangingPassword(true); setIsEditing(false); setMessage(null); } },
      { label: "Ver mis pedidos", action: () => { navigate("/orders"); } },
    ],
  };

  const actions = roleActions[role] || [];

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className={`avatar-container ${isEditing ? 'editable' : ''}`} onClick={handleAvatarClick}>
            <img
              src={getProductImageUrl(isEditing ? formData.avatar : user.avatar) || "/img/user-placeholder.png"}
              alt={user.displayName || user.name || user.email}
              className="profile-avatar"
            />
            {isEditing && <div className="avatar-overlay">Cambiar Foto</div>}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="profile-names">
            <h2>{user.displayName || user.name || user.email}</h2>
            <span className={`profile-role-badge role-${role}`}>
              {role}
            </span>
          </div>
        </div>

        {message && (
          <div className={`profile-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {!isEditing && !isChangingPassword ? (
          <div className="profile-info">
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email || "No disponible"}</span>
            </div>
            <div className="info-item">
              <label>Nombre:</label>
              <span>{user.displayName || user.name || "No disponible"}</span>
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
        ) : isEditing ? (
          <form className="profile-edit-form" onSubmit={onUpdateProfile}>
            <h3>Editar Perfil</h3>
            <div className="form-group">
              <label>Nombre a mostrar</label>
              <Input
                name="displayName"
                value={formData.displayName}
                onChange={handleEditChange}
                placeholder="Tu nombre"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleEditChange}
                placeholder="tu@email.com"
              />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleEditChange}
                placeholder="Tu teléfono"
              />
            </div>
            <div className="form-group">
              <label>URL del Avatar</label>
              <Input
                name="avatar"
                value={formData.avatar}
                onChange={handleEditChange}
                placeholder="https://..."
              />
            </div>
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <form className="profile-edit-form" onSubmit={onChangePassword}>
            <h3>Cambiar Contraseña</h3>
            <div className="form-group">
              <label>Contraseña Actual</label>
              <Input
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>Nueva Contraseña</label>
              <Input
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>Confirmar Nueva Contraseña</label>
              <Input
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Cambiando..." : "Cambiar Contraseña"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsChangingPassword(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="profile-actions">
          {!isEditing && !isChangingPassword && (
            <>
              <h3>Acciones de la cuenta</h3>
              {actions.map((action, idx) => (
                <Button key={idx} type="button" onClick={action.action}>
                  {action.label}
                </Button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

