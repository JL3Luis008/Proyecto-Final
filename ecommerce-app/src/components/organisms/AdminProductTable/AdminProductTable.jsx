import { Pagination } from "../../molecules";
import { Button } from "../../atoms";
import { getProductImageUrl } from "../../../utils/imageUtils";
import "./AdminProductTable.css";

export default function AdminProductTable({ products, onEdit, onDelete, pagination, onPageChange }) {
    return (
        <div className="admin-table-wrapper">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Imagen</th>
                        <th>Producto</th>
                        <th>Marca</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product._id} data-cy="product-row">
                            <td className="td-image">
                                <img
                                    src={getProductImageUrl(product.imagesUrl?.[0])}
                                    alt={product.name}
                                />
                            </td>
                            <td className="td-name" data-cy="product-name">
                                <strong>{product.name}</strong>
                            </td>
                            <td>{product.company}</td>
                            <td>{product.category?.name || "Sin categoría"}</td>
                            <td>${product.price}</td>
                            <td>
                                <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.stock}
                                </span>
                            </td>
                            <td className="td-actions">
                                <Button size="sm" onClick={() => onEdit(product)} data-cy="edit-product-btn">Editar</Button>
                                <Button size="sm" variant="danger" onClick={() => onDelete(product._id)} data-cy="delete-product-btn">Eliminar</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {pagination.totalPages > 1 && (
                <div className="table-pagination">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
}
