import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../components/atoms";

import { fetchCategories } from "../../services/categoryService";
import "./Navigation.css";

const Navigation = ({ isMobile = false, onLinkClick }) => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Store all for subcategory lookup
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [openCategoryId, setOpenCategoryId] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setAllCategories(data);

      // Obtener categorías principales (que no tienen parentCategory)
      const mainCategories = data.filter((cat) => !cat.parentCategory);
      setCategories(mainCategories);
    };

    loadCategories();
  }, []);

  // Función para obtener subcategorías de una categoría principal
  const getSubcategories = (parentId) => {
    const subcats = allCategories.filter(
      (cat) => cat.parentCategory && (cat.parentCategory._id === parentId || cat.parentCategory === parentId)
    );
    return subcats.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Helper to find category by name or approximate name
  const findCategory = (name) => {
    return allCategories.find(c => 
      c.name.toLowerCase().includes(name.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(name.toLowerCase()))
    );
  };

  const videogameCat = findCategory("Juegos de video") || findCategory("Videojuegos");
  const consolesCat = findCategory("Consolas");

  // Define key brands for main navigation
  const mainBrands = ["Nintendo", "Sony Playstation", "Xbox", "Sega"];


  // Si es versión móvil, renderizar solo los enlaces principales
  if (isMobile) {
    return (
      <div className="mobile-navigation">
        {/* Marcas principales */}
        {mainBrands.map(brand => (
          <Link
            key={brand}
            to={`/search?company=${encodeURIComponent(brand)}`}
            className="mobile-nav-link special"
            onClick={onLinkClick}
          >
            <Icon name="tag" size={20} />
            {brand}
          </Link>
        ))}
        
        <Link
          to="/search?sort=rating&order=desc"
          className="mobile-nav-link special"
          onClick={onLinkClick}
        >
          <Icon name="star" size={20} />
          Más vendidos
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
                          onClick={() => setIsDropdownOpen(false)}
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
                              onClick={() => setIsDropdownOpen(false)}
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
            {mainBrands.map(brand => (
               <Link 
                 key={brand}
                 to={`/search?company=${encodeURIComponent(brand)}`} 
                 className="nav-link special"
               >
                 {brand}
               </Link>
            ))}
            <Link to="/search?sort=rating&order=desc" className="nav-link special">
              Más vendidos
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
