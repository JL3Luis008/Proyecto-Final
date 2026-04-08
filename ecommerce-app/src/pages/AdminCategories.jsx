import { useEffect, useState } from "react";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../services/categoryService";
import { Button, Loading, ErrorMessage, Icon } from "../components/atoms";
import Swal from "sweetalert2";
import "./AdminCategories.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    imageURL: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      setError("No se pudieron cargar las categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || "",
        description: category.description || "",
        parentCategory: category.parentCategory?._id || "",
        imageURL: category.imageURL || ""
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: "", description: "", parentCategory: "", imageURL: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);

    // Sanitize payload
    const payload = {
      name: formData.name,
      description: formData.description,
      imageURL: formData.imageURL || null
    };
    if (formData.parentCategory) {
      payload.parentCategory = formData.parentCategory;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, payload);
        Swal.fire('Éxito', 'Categoría actualizada correctamente', 'success');
      } else {
        await createCategory(payload);
        Swal.fire('Éxito', 'Categoría creada correctamente', 'success');
      }
      handleCloseModal();
      loadCategories();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Hubo un error al guardar la categoría.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    const children = categories.filter(c => c.parentCategory?._id === categoryId);
    
    if (children.length > 0) {
        Swal.fire('Atención', `No puedes eliminar esta categoría porque tiene ${children.length} sub-categorías asociadas.`, 'warning');
        return;
    }

    const result = await Swal.fire({
      title: `¿Eliminar categoría '${categoryName}'?`,
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(categoryId);
        setCategories(prev => prev.filter(c => c._id !== categoryId));
        Swal.fire('Eliminada', 'La categoría fue eliminada.', 'success');
      } catch (err) {
        Swal.fire('Error', 'No se pudo eliminar la categoría.', 'error');
      }
    }
  };

  // Derived state for parent categories (excluding the one being edited to prevent circular references)
  const potentialParents = categories.filter(c => 
    !c.parentCategory && (!editingCategory || c._id !== editingCategory._id)
  );

  if (loading) return <Loading message="Cargando categorías..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="admin-categories-container">
      <div className="admin-header">
        <h1>Gestión de Categorías</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <Icon name="plus" size={18} /> Nueva Categoría
        </Button>
      </div>

      <div className="admin-categories-grid">
        {potentialParents.map(parent => {
          const children = categories.filter(c => c.parentCategory?._id === parent._id);
          return (
            <div key={parent._id} className="category-card">
              <div className="category-card-header">
                <h3>{parent.name}</h3>
                <div className="category-card-actions">
                  <button className="action-btn edit-btn" onClick={() => handleOpenModal(parent)} title="Editar">
                    <Icon name="edit2" size={16} />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDelete(parent._id, parent.name)} title="Eliminar">
                    <Icon name="trash2" size={16} />
                  </button>
                </div>
              </div>
              <p className="category-description">{parent.description}</p>
              
              {children.length > 0 && (
                <div className="subcategories-list">
                  <h4>Subcategorías:</h4>
                  <ul>
                    {children.map(child => (
                      <li key={child._id}>
                        <span>{child.name}</span>
                        <div className="subcat-actions">
                          <button className="action-btn edit-btn small" onClick={() => handleOpenModal(child)}>
                             <Icon name="edit2" size={14} />
                          </button>
                          <button className="action-btn delete-btn small" onClick={() => handleDelete(child._id, child.name)}>
                             <Icon name="trash2" size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  required 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Descripción:</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleFormChange} 
                  required 
                  className="form-input"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Categoría Padre (Opcional):</label>
                <select 
                  name="parentCategory" 
                  value={formData.parentCategory} 
                  onChange={handleFormChange}
                  className="form-input"
                >
                  <option value="">Ninguna (Categoría Principal)</option>
                  {potentialParents.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <small className="form-hint">Si seleccionas una categoría padre, esta se convertirá en una subcategoría.</small>
              </div>
              <div className="form-group">
                <label>URL de Imagen (Opcional):</label>
                <input 
                  type="url" 
                  name="imageURL" 
                  value={formData.imageURL} 
                  onChange={handleFormChange} 
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div className="admin-modal-actions">
                <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={formSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={formSubmitting}>
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
