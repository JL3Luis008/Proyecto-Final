import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/common/Icon/Icon";
import categoriesData from "../../data/categories.json";
import "./Navigation.css";

const Navigation = ({ isMobile = false, onLinkClick }) => {
  const [categories, setCategories] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState(null);

  useEffect(() => {
    // Obtener categorías principales (que son parent de otras categorías)
    const allParentIds = new Set(
      categoriesData
        .filter((cat) => cat.parentCategory)
        .map((cat) => cat.parentCategory._id)
    );

    // Filtrar categorías que son padres o que no tienen parent
    const mainCategories = categoriesData.filter(
      (cat) => !cat.parentCategory || allParentIds.has(cat._id)
    );

    setCategories(mainCategories);
  }, []);

  // Función para obtener subcategorías de una categoría principal
  const getSubcategories = (parentId) => {
    const subcategories = categoriesData.filter(
      (cat) => cat.parentCategory && cat.parentCategory._id === parentId
    );
    return subcategories.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Si es versión móvil, renderizar solo los enlaces principales
  if (isMobile) {
    return (
      <div className="mobile-navigation">
        {/* Ofertas especiales */}
        <Link
          to="/videogames"
          className="mobile-nav-link special"
          onClick={onLinkClick}
        >
          <Icon name="tag" size={20} />
          Videojuegos
        </Link>
        <Link
          to="/consoles"
          className="mobile-nav-link special"
          onClick={onLinkClick}
        >
          <Icon name="sparkles" size={20} />
          Consolas
        </Link>
        <Link
          to="/more"
          className="mobile-nav-link special"
          onClick={onLinkClick}
        >
          <Icon name="star" size={20} />
          Más...
        </Link>


        {/* Categorías principales */}
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/category/${category._id}`}
            className="mobile-nav-link"
            onClick={onLinkClick}
          >
            <Icon name="chevronRight" size={16} />
            {category.name}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="navigation">
      <div className="container">
        <div className="navigation-content">
          {/* Menú de todas las categorías */}
          <div className="categories-dropdown">
            <button
              className="categories-menu-btn"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            >
              <Icon name="menu" size={16} />
              <span>Todas las categorías</span>
              <Icon name="chevronDown" size={14} />
            </button>

{isDropdownOpen && (
  <div className="categories-dropdown-menu">
    {categories.map((category) => {
      const subcategories = getSubcategories(category._id);
      const isOpen = openCategoryId === category._id;

      return (
        <div key={category._id} className="category-group">

          <div className="category-header">

            {/* Link de la categoría (NO despliega subcategorías) */}
            <Link
              to={`/category/${category._id}`}
              className="category-link main-category"
            >
              {category.name}
            </Link>

            {/* Flecha para abrir/cerrar subcategorías */}
            {subcategories.length > 0 && (
              <button
                className="toggle-subcats-btn"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenCategoryId(isOpen ? null : category._id);
                }}
              >
                <Icon
                  name={isOpen ? "chevronDown" : "chevronRight"}
                  size={12}
                />
              </button>
            )}

          </div>

          {/* Subcategorías (solo visibles si se abre con la flecha) */}
          {isOpen && subcategories.length > 0 && (
            <div className="subcategories">
              {subcategories.map((subcat) => (
                <Link
                  key={subcat._id}
                  to={`/category/${subcat._id}`}
                  className="category-link sub-category"
                >
                  {subcat.name}
                </Link>
              ))}
            </div>
          )}

        </div>
      );
    })}
  </div>
)}

          </div>

          {/* Navegación horizontal */}
          <nav className="categories-nav">
            <Link to="/offers" className="nav-link special">
              Videojuegos
            </Link>
            <Link to="/new" className="nav-link special">
              Consolas
            </Link>
            <Link to="/bestsellers" className="nav-link special">
              Más vendidos
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
