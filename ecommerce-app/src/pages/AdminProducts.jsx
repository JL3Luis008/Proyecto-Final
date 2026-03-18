import { useState, useEffect } from "react";
import { getProducts, deleteProduct } from "../services/productService";
import AdminProductTable from "../components/organisms/AdminProductTable/AdminProductTable";
import AdminProductForm from "../components/organisms/AdminProductForm/AdminProductForm";
import { Button, Loading, ErrorMessage } from "../components/atoms";
import "./AdminProducts.css";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    const loadProducts = async (page = 1) => {
        setLoading(true);
        try {
            const data = await getProducts(page, 15);
            setProducts(data.products || []);
            setPagination(data.pagination || {});
            setError(null);
        } catch (err) {
            setError("Error al cargar los productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts(currentPage);
    }, [currentPage]);

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                console.log("Deleting product with ID:", id);
                await deleteProduct(id);
                loadProducts(currentPage);
            } catch (err) {
                console.error("Delete error:", err.response?.data || err.message);
                const serverError = err.response?.data?.message ||
                    err.response?.data?.errors?.[0]?.msg ||
                    err.response?.data?.error ||
                    "Error al eliminar el producto";
                alert(`Error: ${serverError}`);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingProduct(null);
    };

    const handleFormSuccess = () => {
        handleFormClose();
        loadProducts(currentPage);
    };

    return (
        <div className="admin-products-container">
            <div className="admin-header">
                <h1>Gestión de Productos</h1>
                <Button onClick={handleCreate} variant="primary">
                    Nuevo Producto
                </Button>
            </div>

            {error && <ErrorMessage message={error} />}

            {loading && !isFormOpen ? (
                <Loading message="Cargando productos..." />
            ) : (
                <AdminProductTable
                    products={products}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pagination={pagination}
                    onPageChange={setCurrentPage}
                />
            )}

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <AdminProductForm
                            product={editingProduct}
                            onClose={handleFormClose}
                            onSuccess={handleFormSuccess}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
