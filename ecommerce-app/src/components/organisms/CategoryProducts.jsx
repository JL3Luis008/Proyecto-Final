import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Breadcrumb from "../../layout/Breadcrumb/Breadcrumb";
import { getCategoryById } from "../../services/categoryService";
import { getProductsByCategoryId } from "../../services/productService";
import { ProductCard, Pagination } from "../molecules";
import { ErrorMessage, Loading } from "../atoms";

import "./CategoryProducts.css";

export default function CategoryProducts({ categoryId }) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Reset page when category changes
    setPage(1);
  }, [categoryId]);

  const {
    data: category,
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: () => getCategoryById(categoryId),
    enabled: !!categoryId,
  });

  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ["products", "category", categoryId, page],
    queryFn: () => getProductsByCategoryId(categoryId, page, 10),
    enabled: !!categoryId,
  });

  const loading = categoryLoading || productsLoading;
  const error = categoryError || productsError ? "Error al cargar la categoría o productos" : null;
  const products = productsData?.products || [];
  const paginationInfo = productsData?.pagination || { totalPages: 1, currentPage: 1 };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && !category) {
    return (
      <div className="category-products-root">
        <Loading message="Cargando categoría..." />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="category-products-root">
        <ErrorMessage message={error || "Categoría no encontrada"}>
          <p className="category-products-muted">
            Vuelve al <Link to="/">inicio</Link> o explora nuestras categorías
            destacadas.
          </p>
        </ErrorMessage>
      </div>
    );
  }

  return (
    <div className="category-products-root">
      <Breadcrumb
        items={[{ label: "Inicio", to: "/" }, { label: category.name }]}
      />
      <div className="category-products-container">
        <div className="category-products-header">
          <div className="category-products-title">
            <h1 className="category-products-h1">
              {category.parentCategory
                ? `${category.parentCategory.name}: ${category.name}`
                : category.name}
            </h1>
            {category.description && (
              <p className="category-products-muted">{category.description}</p>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Loading message="Cargando productos..." />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="category-products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  orientation="vertical"
                  className="card"
                />
              ))}
            </div>
            <Pagination
              currentPage={paginationInfo.currentPage}
              totalPages={paginationInfo.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <ErrorMessage message="No se encontraron productos">
            <p className="category-products-muted">
              No hay productos disponibles en esta categoría por el momento.
            </p>
          </ErrorMessage>
        )}
      </div>
    </div>
  );
}

