

import { useEffect, useState, useCallback } from "react";
import { BannerCarousel, List } from "../components/organisms";
import { ErrorMessage, Loading, Button } from "../components/atoms";
import { Pagination } from "../components/molecules";
import homeImages from "../data/homeImages.json";
import { getProducts } from "../services/productService";

import "./Home.css";


export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    currentPage: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [display, setDisplay] = useState("grid");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const productsData = await getProducts(page, limit);
        console.log("Products loaded:", productsData);

        if (productsData && productsData.products) {
          setProducts(productsData.products);
          if (productsData.pagination) {
            setPaginationInfo(productsData.pagination);
          }
        } else if (Array.isArray(productsData)) {
          // Fallback if API returns array directly
          setProducts(productsData);
        }
      } catch (err) {
        setError("No se pudieron cargar los productos. Intenta más tarde.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [page, limit]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleDisplay = () => {
    display === "grid" ? setDisplay("list-vertical") : setDisplay("grid");
  };

  return (
    <div>
      <BannerCarousel banners={homeImages} />
      {loading ? (
        <Loading>Cargando productos...</Loading>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : products.length > 0 ? (
        <div>
          <div className="home-controls">
            <Button onClick={toggleDisplay}>
              {display === "grid" ? "Ver como lista" : "Ver como cuadrícula"}
            </Button>
          </div>
          <List
            title="Productos recomendados"
            products={products}
            layout={display}
          />
          <Pagination
            currentPage={paginationInfo.currentPage}
            totalPages={paginationInfo.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <ErrorMessage>No hay productos en el catálogo</ErrorMessage>
      )}
    </div>
  );
}





/* import { useEffect, useState } from "react";
import BannerCarousel from "../components/BannerCarousel";
import List from "../components/List/List";
import ErrorMessage from "../components/common/ErrorMessage/ErrorMessage";
import Loading from "../components/common/Loading/Loading";
import homeImages from "../data/homeImages.json";
import { fetchProducts } from "../services/productService";
import Button from "../components/common/Button";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    const productsData = await fetchProducts();
    setProducts(productsData.products);
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        await loadProducts();
        setLoading(false);
      } catch (e) {
        if (!ignore) {
          setError("No se pudieron cargar los productos. Intenta más tarde.");
          console.error(e);
          setProducts([]);
          setLoading(false);
        }
      }
    })();


    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <BannerCarousel banners={homeImages} />
      {loading ? (
        <Loading>Cargando productos...</Loading>
      ) : error ? (
        <ErrorMessage>
          <span>{error}</span>
          <Button
            type="button"
            variant="primary"
            onClick={(e) => {
              loadProducts().then(setLoading(false)).catch((err) => {
                setError("No se pudieron cargar los productos. Intenta más tarde.");
                console.error(e);
                setProducts([]);
                setLoading(false);
              });
            }}
          >
            Volver a cargar
          </Button>
        </ErrorMessage>
      ) : products.length > 0 ? (
        <List
          title="Productos recomendados"
          products={products}
          layout="grid"
        />
      ) : (
        <ErrorMessage>No hay productos en el catálogo</ErrorMessage>
      )}
    </div>
  );
} */