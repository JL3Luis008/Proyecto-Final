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
  const page = parseInt(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sort") || "name";
  const sortOrder = searchParams.get("order") || "asc";

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      if (!query) return;

      try {
        setLoading(true);
        const data = await searchProducts({
          q: query,
          page,
          sort: sortBy,
          order: sortOrder,
          limit: 10
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
  }, [query, page, sortBy, sortOrder]);

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

  const hasQuery = query.length > 0;
  const showNoResults = hasQuery && !loading && products.length === 0;

  return (
    <div className="search-results-fullwidth">
      <header className="search-results-header">
        <div>
          <h1 className="search-results-title">
            {hasQuery
              ? `Resultados para "${query}"`
              : "Explora nuestro catálogo"}
          </h1>
          <p className="search-results-description">
            {hasQuery
              ? "Estos son los productos que encontramos basados en tu búsqueda."
              : "Usa la barra de búsqueda para encontrar rápidamente lo que necesitas."}
          </p>
        </div>
        {hasQuery && (
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

      {!loading && hasQuery && !showNoResults && (
        <>
          <List
            products={products}
            layout="vertical"
            title={`Mostrando resultados para "${query}"`}
          />
          <Pagination
            currentPage={paginationInfo.currentPage}
            totalPages={paginationInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {!loading && !hasQuery && (
        <div className="search-results-message">
          <h3>¿Buscas algo en especial?</h3>
          <p>
            Comienza a escribir en la barra de búsqueda y te mostraremos los
            resultados aquí mismo.
          </p>
        </div>
      )}
    </div>
  );
}

