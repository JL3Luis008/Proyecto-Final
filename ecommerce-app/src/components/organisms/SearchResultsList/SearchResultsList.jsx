import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchProducts } from "../../../services/productService";
import List from "../List/List";
import { Pagination } from "../../molecules";
import "./SearchResultsList.css";

export default function SearchResultsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  const query = (searchParams.get("q") || "").trim();
  const company = (searchParams.get("company") || "").trim();
  const categoryId = (searchParams.get("category") || "").trim();
  const page = parseInt(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sort") || "name";
  const sortOrder = searchParams.get("order") || "asc";

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      if (!query && !company && !categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await searchProducts({
          q: query || undefined,
          company: company || undefined,
          category: categoryId || undefined,
          page,
          sort: sortBy,
          order: sortOrder,
          limit: 12
        });

        if (isMounted) {
          setProducts(data.products || []);
          setPaginationInfo(data.pagination || { totalPages: 1, currentPage: 1 });
        }
      } catch (error) {
        console.error("Error in SearchResultsList:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [query, company, categoryId, page, sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("sort", newSort);
    newParams.set("page", 1); // Reset to page 1 on search change
    setSearchParams(newParams);
  };

  const handleOrderToggle = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("order", sortOrder === "asc" ? "desc" : "asc");
    setSearchParams(newParams);
  };

  const hasFilters = query.length > 0 || company.length > 0 || categoryId.length > 0;
  const showNoResults = hasFilters && !loading && products.length === 0;

  return (
    <div className="search-results-fullwidth">
      <header className="search-results-header">
        <div>
          <h1 className="search-results-title">
            {query 
              ? `Resultados para "${query}"` 
              : company 
              ? `Productos de ${company}`
              : "Explora nuestro catálogo"}
          </h1>
          <p className="search-results-description">
            {(query || company)
              ? "Estos son los productos que encontramos basados en tu selección."
              : "Usa los menús o la barra de búsqueda para encontrar lo que necesitas."}
          </p>
        </div>
        {hasFilters && (
          <div className="search-results-controls">
            <label>Ordenar por:</label>
            <select value={sortBy} onChange={(e) => handleSortChange(e.target.value)}>
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="createdAt">Novedades</option>
            </select>
            <button
              type="button"
              className="sort-btn"
              onClick={handleOrderToggle}
            >
              {sortOrder === "asc" ? "Ascendente" : "Descendente"}
            </button>
          </div>
        )}
      </header>

      {loading && (
        <div className="search-results-message">
          <h3>Buscando productos...</h3>
          <p>Esto puede tomar unos segundos.</p>
        </div>
      )}

      {!loading && showNoResults && (
        <div className="search-results-message">
          <h3>No encontramos coincidencias para "{query}"</h3>
          <p>
            Prueba con otros términos o recorre nuestras{" "}
            <Link to="/">categorías populares</Link>.
          </p>
        </div>
      )}

      {!loading && hasFilters && !showNoResults && (
        <>
          <List
            products={products}
            layout="vertical"
            title={query ? `Resultados para "${query}"` : company ? `Catálogo de ${company}` : ""}
          />
          <Pagination
            currentPage={paginationInfo.currentPage}
            totalPages={paginationInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!loading && !hasFilters && (
        <div className="search-results-message">
          <h3>¿Buscas algo en especial?</h3>
          <p>
            Comienza a escribir en la barra de búsqueda o explora nuestras{" "}
            <Link to="/">categorías</Link>.
          </p>
        </div>
      )}
    </div>
  );
}

