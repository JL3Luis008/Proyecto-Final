import { useState, useEffect } from "react";
import { createProduct, updateProduct, uploadProductImage } from "../../../services/productService";
import { fetchCategories } from "../../../services/categoryService";
import { getProductImageUrl } from "../../../utils/imageUtils";
import { Button, Input, ErrorMessage } from "../../atoms";
import "./AdminProductForm.css";

export default function AdminProductForm({ product, onClose, onSuccess }) {
    const isEdit = !!product;
    const [formData, setFormData] = useState({
        name: product?.name || "",
        description: product?.description || "",
        details: product?.details || "",
        includes: product?.includes || "",
        condition: product?.condition || "New",
        region: product?.region || "",
        company: product?.company || "",
        price: product?.price || "",
        stock: product?.stock || "",
        category: product?.category?._id || product?.category || "",
        imagesUrl: product?.imagesUrl || ["https://placehold.co/800x600.png"],
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                console.error("Error loading categories", err);
            }
        };
        loadCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const data = await uploadProductImage(file);
            // Append new image
            const newImages = [...formData.imagesUrl];
            // If the first image is the placeholder, replace it
            if (newImages.length === 1 && newImages[0].includes("placehold.co")) {
                newImages[0] = data.imageUrl;
            } else {
                newImages.push(data.imageUrl);
            }

            setFormData((prev) => ({ ...prev, imagesUrl: newImages }));
        } catch (err) {
            setError("Error al subir la imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index) => {
        const newImages = formData.imagesUrl.filter((_, i) => i !== index);
        // If empty, put placeholder or leave empty (backend requires 1)
        setFormData((prev) => ({ ...prev, imagesUrl: newImages }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation
        if (!formData.category) {
            setError("La categoría es obligatoria");
            setLoading(false);
            return;
        }

        try {
            if (isEdit) {
                await updateProduct(product._id, formData);
            } else {
                await createProduct(formData);
            }
            onSuccess();
        } catch (err) {
            console.error("Save error:", err.response?.data);
            let errorMessage = "Error al guardar el producto";

            if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
                // Extract the first validation error message
                errorMessage = err.response.data.errors[0].msg;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="admin-product-form" onSubmit={handleSubmit}>
            <h2>{isEdit ? "Editar Producto" : "Nuevo Producto"}</h2>

            {error && <ErrorMessage message={error} />}

            <div className="form-grid">
                <Input
                    label="Nombre del Producto"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Compañía/Marca"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                />

                <div className="input-group">
                    <label className="input-label">Categoría</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="">Seleccione una categoría</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <Input
                    label="Precio"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Región"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                />

                <div className="input-group">
                    <label className="input-label">Condición</label>
                    <select
                        name="condition"
                        value={formData.condition}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="New">Nuevo</option>
                        <option value="Used">Usado</option>
                        <option value="Refurbished">Reacondicionado</option>
                        <option value="Open Box">Caja Abierta</option>
                    </select>
                </div>
            </div>

            <div className="form-grid">
                <Input
                    label="¿Qué incluye?"
                    name="includes"
                    value={formData.includes}
                    onChange={handleChange}
                    placeholder="Ej: Cable USB, Manual, Estuche"
                    required
                />
            </div>

            <div className="form-group">
                <label className="input-label">Descripción Corta</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field textarea"
                    required
                ></textarea>
            </div>

            <div className="form-group">
                <label className="input-label">Detalles del Producto (Full Specs)</label>
                <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    className="input-field textarea-large"
                    required
                ></textarea>
            </div>

            <div className="form-group">
                <label className="input-label">Imágenes</label>
                <div className="image-preview-container">
                    {formData.imagesUrl.map((url, idx) => (
                        <div key={idx} className="image-preview">
                            <img src={getProductImageUrl(url)} alt={`Preview ${idx}`} />
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => handleRemoveImage(idx)}
                                title="Eliminar imagen"
                            >
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
                <input
                    type="file"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    accept="image/*"
                />
                {uploading && <p className="muted">Subiendo imagen...</p>}
            </div>

            <div className="form-actions">
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Guardando..." : "Guardar Producto"}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                    Cancelar
                </Button>
            </div>
        </form>
    );
}
