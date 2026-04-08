import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getProductImageUrl } from "../utils/imageUtils";
import { deactivateAccount } from "../services/userService";
import { Button, Input, Loading, ErrorMessage } from "../components/atoms";
import "./Settings.css";

export default function Settings() {
    const navigate = useNavigate();
    const { user, updateProfile, updatePassword, uploadAvatar, logout, loading } = useAuth();

    // Tab state
    const [activeTab, setActiveTab] = useState("profile");
    
    // Danger Zone state
    const [deactivateLoading, setDeactivateLoading] = useState(false);

    const [profileData, setProfileData] = useState({
        displayName: "",
        phone: "",
    });
    const [profileStatus, setProfileStatus] = useState({ loading: false, error: null, success: false });

    // Preferences State
    const [preferencesData, setPreferencesData] = useState({
        theme: "system",
        emailNotifications: true,
    });
    const [preferencesStatus, setPreferencesStatus] = useState({ loading: false, error: null, success: false });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: null, success: false });

    // Avatar Upload State
    const [avatarStatus, setAvatarStatus] = useState({ loading: false, error: null, success: false });

    // Initialize profile data from context
    useEffect(() => {
        if (user) {
            setProfileData({
                displayName: user.displayName || user.name || "",
                phone: user.phone || "",
            });
            if (user.preferences) {
                setPreferencesData({
                    theme: user.preferences.theme || "system",
                    emailNotifications: user.preferences.emailNotifications !== undefined ? user.preferences.emailNotifications : true,
                });
            }
        }
    }, [user]);

    // Handlers
    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({ ...prev, [name]: value }));
        setProfileStatus({ ...profileStatus, error: null, success: false });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setPasswordStatus({ ...passwordStatus, error: null, success: false });
    };

    // Submit Handlers
    const onProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileStatus({ loading: true, error: null, success: false });

        const result = await updateProfile(profileData);

        if (result.success) {
            setProfileStatus({ loading: false, error: null, success: true });
            // Redirect after a short delay to show success
            setTimeout(() => {
                navigate("/profile");
            }, 1500);
        } else {
            setProfileStatus({ loading: false, error: result.error, success: false });
        }
    };

    const onPasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordStatus({ loading: false, error: "Las contraseñas nuevas no coinciden", success: false });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordStatus({ loading: false, error: "La contraseña debe tener al menos 6 caracteres", success: false });
            return;
        }

        setPasswordStatus({ loading: true, error: null, success: false });

        const result = await updatePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });

        if (result.success) {
            setPasswordStatus({ loading: false, error: null, success: true });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Reset
        } else {
            setPasswordStatus({ loading: false, error: result.error, success: false });
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarStatus({ loading: true, error: null, success: false });

        const result = await uploadAvatar(file);

        if (result.success) {
            // Update profile with the new avatar URL
            const finalData = { ...profileData, avatar: result.imageUrl };
            await updateProfile(finalData);
            setAvatarStatus({ loading: false, error: null, success: true });
        } else {
            setAvatarStatus({ loading: false, error: result.error, success: false });
        }
    };

    const handleDeactivateAccount = async () => {
        if (!window.confirm("¡ATENCIÓN! Estás a punto de desactivar tu cuenta. Perderás el acceso inmediato y no podrás recuperarla sin contactar a soporte. ¿Estás absolutamente seguro(a)?")) {
            return;
        }

        setDeactivateLoading(true);
        try {
            await deactivateAccount();
            // Desloguear al usuario y redirigir al login
            await logout(); 
        } catch (error) {
            console.error("Error al desactivar la cuenta", error);
            alert("Ocurrió un error al desactivar la cuenta.");
        } finally {
            setDeactivateLoading(false);
        }
    };

    const handlePreferencesSubmit = async () => {
        setPreferencesStatus({ loading: true, error: null, success: false });
        const result = await updateProfile({ preferences: preferencesData });
        if (result.success) {
            setPreferencesStatus({ loading: false, error: null, success: true });
            setTimeout(() => setPreferencesStatus(prev => ({ ...prev, success: false })), 3000);
        } else {
            setPreferencesStatus({ loading: false, error: result.error, success: false });
        }
    };

    const toggleTheme = () => {
        setPreferencesData(prev => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark'
        }));
    };

    const toggleEmailNotifications = () => {
        setPreferencesData(prev => ({
            ...prev,
            emailNotifications: !prev.emailNotifications
        }));
    };

    if (loading || !user) {
        return <Loading message="Cargando configuración..." />;
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2>Configuración de Cuenta</h2>
                <p>Administra tu perfil, contraseña y preferencias</p>
            </div>

            <div className="settings-container">
                {/* Sidebar Navigation */}
                <aside className="settings-sidebar">
                    <nav>
                        <button
                            className={`settings-tab ${activeTab === "profile" ? "active" : ""}`}
                            onClick={() => setActiveTab("profile")}
                        >
                            Datos Personales
                        </button>
                        <button
                            className={`settings-tab ${activeTab === "security" ? "active" : ""}`}
                            onClick={() => setActiveTab("security")}
                        >
                            Seguridad
                        </button>
                        <button
                            className={`settings-tab ${activeTab === "preferences" ? "active" : ""}`}
                            onClick={() => setActiveTab("preferences")}
                        >
                            Preferencias
                        </button>
                    </nav>
                </aside>

                {/* Content Area */}
                <div className="settings-content">

                    {/* PROFILE TAB */}
                    {activeTab === "profile" && (
                        <div className="settings-section">
                            <h3>Datos Personales</h3>

                            <div className="avatar-section">
                                <div className="avatar-wrapper">
                                    <img
                                        src={getProductImageUrl(user.avatar) || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user._id}
                                        alt="Perfil"
                                        className="avatar-image"
                                    />
                                    {avatarStatus.loading && <div className="avatar-loading">Subiendo...</div>}
                                </div>
                                <div className="avatar-actions">
                                    <label htmlFor="avatar-upload" className="btn-avatar-upload">
                                        Cambiar Foto
                                    </label>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={avatarStatus.loading}
                                        style={{ display: "none" }}
                                    />
                                    {avatarStatus.error && <p className="error-text mt-1">{avatarStatus.error}</p>}
                                    {avatarStatus.success && <p className="success-text mt-1">¡Foto actualizada!</p>}
                                </div>
                            </div>

                            <form onSubmit={onProfileSubmit} className="settings-form">
                                <div className="form-group-single">
                                    <Input
                                        label="Nombre Completo / Nombre a mostrar"
                                        name="displayName"
                                        value={profileData.displayName}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Correo Electrónico (No modificable)"
                                    type="email"
                                    value={user.email}
                                    disabled
                                    readOnly
                                />

                                <Input
                                    label="Número de Teléfono"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    placeholder="+1 234 567 8900"
                                />

                                {profileStatus.error && <ErrorMessage message={profileStatus.error} />}
                                {profileStatus.success && (
                                    <div className="alert-success">Perfil actualizado correctamente.</div>
                                )}

                                <div className="form-actions">
                                    <Button type="submit" variant="primary" loading={profileStatus.loading}>
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === "security" && (
                        <div className="settings-section">
                            <h3>Seguridad y Contraseña</h3>
                            <p className="section-description">
                                Asegúrate de usar una contraseña larga (mínimo 6 caracteres) e incluir números y símbolos.
                            </p>

                            <form onSubmit={onPasswordSubmit} className="settings-form">
                                <Input
                                    label="Contraseña Actual"
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <Input
                                    label="Nueva Contraseña"
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />
                                <Input
                                    label="Confirmar Nueva Contraseña"
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    required
                                />

                                {passwordStatus.error && <ErrorMessage message={passwordStatus.error} />}
                                {passwordStatus.success && (
                                    <div className="alert-success">Contraseña cambiada exitosamente.</div>
                                )}

                                <div className="form-actions">
                                    <Button type="submit" variant="primary" loading={passwordStatus.loading}>
                                        Actualizar Contraseña
                                    </Button>
                                </div>
                            </form>

                            <div className="danger-zone mt-5" style={{ marginTop: "3rem", borderTop: "1px solid #ffcccc", paddingTop: "2rem" }}>
                                <h3 className="text-danger" style={{ color: "#d9534f" }}>Zona Peligrosa</h3>
                                <p className="section-description text-muted">
                                    Desactivar tu cuenta es una acción irreversible. Ya no podrás acceder a tu historial de pedidos ni a tu lista de deseos.
                                </p>
                                <Button 
                                    variant="danger" 
                                    onClick={handleDeactivateAccount}
                                    loading={deactivateLoading}
                                    disabled={deactivateLoading}
                                >
                                    Desactivar mi cuenta
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* PREFERENCES TAB */}
                    {activeTab === "preferences" && (
                        <div className="settings-section">
                            <h3>Preferencias</h3>
                            <p className="section-description">Ajusta tu experiencia en la plataforma.</p>

                            <div className="preferences-list">
                                <div className="preference-item">
                                    <div>
                                        <h4>Tema Oscuro</h4>
                                        <p>Cambia la apariencia de la aplicación a colores oscuros.</p>
                                    </div>
                                    <div 
                                        className={`toggle-switch pseudo-toggle ${preferencesData.theme === 'dark' ? 'active' : ''}`}
                                        onClick={toggleTheme}
                                        style={{ cursor: 'pointer' }}
                                    ></div>
                                </div>

                                <div className="preference-item">
                                    <div>
                                        <h4>Notificaciones por Email</h4>
                                        <p>Recibe ofertas, encuestas y noticias en tu correo.</p>
                                    </div>
                                    <div 
                                        className={`toggle-switch pseudo-toggle ${preferencesData.emailNotifications ? 'active' : ''}`}
                                        onClick={toggleEmailNotifications}
                                        style={{ cursor: 'pointer' }}
                                    ></div>
                                </div>

                                {preferencesStatus.error && <ErrorMessage message={preferencesStatus.error} />}
                                {preferencesStatus.success && <div className="alert-success mt-3" style={{ padding: "0.5rem 1rem" }}>Preferencias actualizadas correctamente.</div>}
                                
                                <div className="form-actions mt-4" style={{ marginTop: "2rem" }}>
                                    <Button type="button" variant="primary" loading={preferencesStatus.loading} onClick={handlePreferencesSubmit}>
                                        Guardar Preferencias
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
