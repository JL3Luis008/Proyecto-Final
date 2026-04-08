import { useEffect, useState } from "react";
import { getAllUsers, toggleUserStatus, updateUser } from "../services/userService";
import { Loading, ErrorMessage, Icon, Button } from "../components/atoms";
import { getProductImageUrl } from "../utils/imageUtils";
import Swal from "sweetalert2";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [usersInfo, setUsersInfo] = useState({ users: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== "") params.isActive = activeFilter;
      
      const data = await getAllUsers(params);
      setUsersInfo(data);
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, activeFilter]);

  const handleToggleStatus = async (userId, currentStatus, userName) => {
    const actionText = currentStatus ? "desactivar" : "activar";
    
    const result = await Swal.fire({
      title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} usuario?`,
      text: `Estás a punto de ${actionText} a ${userName}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#d33' : '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Sí, ${actionText}`
    });

    if (result.isConfirmed) {
      try {
        await toggleUserStatus(userId);
        Swal.fire('Éxito', `El usuario ha sido ${currentStatus ? "desactivado" : "activado"}.`, 'success');
        fetchUsers(); // Refresh list
      } catch (err) {
        Swal.fire('Error', 'No se pudo cambiar el estado del usuario.', 'error');
      }
    }
  };

  const handleRoleChange = async (userId, newRole, userName) => {
    const result = await Swal.fire({
      title: '¿Cambiar rol?',
      text: `El usuario ${userName} será cambiado a ${newRole}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cambiar'
    });

    if (result.isConfirmed) {
      try {
        await updateUser(userId, { role: newRole });
        Swal.fire('Éxito', 'Rol actualizado correctamente', 'success');
        fetchUsers();
      } catch(err) {
        Swal.fire('Error', 'No se pudo actualizar el rol.', 'error');
      }
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (usersInfo.pagination?.totalPages || 1)) {
        setPage(newPage);
    }
  };

  if (loading && usersInfo.users.length === 0) return <Loading message="Cargando usuarios..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <h1>Gestión de Usuarios</h1>
        <div className="admin-filters">
           <select 
             value={roleFilter} 
             onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
             className="status-filter-select"
           >
             <option value="">Todos los Roles</option>
             <option value="admin">Admin</option>
             <option value="customer">Customer</option>
           </select>
           
           <select 
             value={activeFilter} 
             onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
             className="status-filter-select"
           >
             <option value="">Cualquier estado</option>
             <option value="true">Activos</option>
             <option value="false">Inactivos</option>
           </select>
        </div>
      </div>

      <div className="admin-table-wrapper">
        {loading && usersInfo.users.length > 0 && <div className="table-loader-overlay"><Loading /></div>}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Rol</th>
              <th>Registro</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usersInfo.users.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table-message">
                  No se encontraron usuarios.
                </td>
              </tr>
            ) : (
                usersInfo.users.map(u => (
                <tr key={u._id} className={!u.isActive ? "row-inactive" : ""}>
                  <td>
                    <div className="user-cell">
                        <img 
                          src={getProductImageUrl(u.avatar) || "/img/user-placeholder.png"} 
                          alt="avatar" 
                          className="user-cell-avatar" 
                        />
                        <div className="user-cell-info">
                            <span className="user-name">{u.displayName || "Sin nombre"}</span>
                            <span className="user-id" title={u._id}>{u._id.substring(u._id.length - 8)}</span>
                        </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell-info">
                        <span>{u.email}</span>
                        {u.phone && <span className="user-phone">{u.phone}</span>}
                    </div>
                  </td>
                  <td>
                     <select 
                        className={`role-select role-${u.role}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value, u.displayName || u.email)}
                     >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                     </select>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                      <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? "Activo" : "Inactivo"}
                      </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                       className={`action-btn toggle-btn ${u.isActive ? 'suspend' : 'activate'}`} 
                       onClick={() => handleToggleStatus(u._id, u.isActive, u.displayName || u.email)}
                       title={u.isActive ? "Suspender Usuario" : "Activar Usuario"}
                    >
                       <Icon name={u.isActive ? "userX" : "userCheck"} size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {usersInfo.pagination && usersInfo.pagination.totalPages > 1 && (
        <div className="pagination-controls mt-4">
            <Button 
              variant="secondary" 
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="pagination-info">
                Página {page} de {usersInfo.pagination.totalPages}
            </span>
            <Button 
              variant="secondary" 
              onClick={() => handlePageChange(page + 1)}
              disabled={page === usersInfo.pagination.totalPages}
            >
              Siguiente
            </Button>
        </div>
      )}
    </div>
  );
}
