import User from "../models/user.js";
import Product from "../models/product.js";
import Category from "../models/category.js";

/**
 * Resetea la base de datos de pruebas eliminando colecciones críticas.
 * Solo se deben eliminar datos de prueba, nunca producción.
 */
export const resetDatabase = async (req, res, next) => {
  try {
    // Solo permitimos esto si NO estamos en producción
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ 
        message: "Operación no permitida en producción" 
      });
    }

    console.log("🧹 Reseteando base de datos de pruebas...");

    // Eliminamos todos los usuarios
    await User.deleteMany({});
    
    res.status(200).json({ message: "Base de datos de pruebas reseteada con éxito" });
  } catch (error) {
    next(error);
  }
};

/**
 * Inserta productos de prueba rápidos para la suite E2E de Cypress si la DB está vacía.
 */
export const seedDatabase = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Operación no permitida en producción" });
    }

    const count = await Product.countDocuments();
    if (count > 0) {
      return res.status(200).json({ message: "La base de datos de pruebas ya tiene productos." });
    }

    console.log("🌱 Insertando productos de prueba para Cypress...");

    const testCategory = new Category({
      name: "E2E Test Category",
      description: "Categoría de prueba"
    });
    await testCategory.save();

    const productTest1 = new Product({
      name: "Producto Cypress 1",
      description: "Utilizado para probar la adición de carritos.",
      details: "Detalles del producto de prueba 1",
      includes: "Solo el producto",
      condition: "Nuevo",
      region: "Global",
      company: "RetroBits Test Company",
      price: 100,
      stock: 10,
      category: testCategory._id,
      imagesUrl: ["/img/products/placeholder.svg"]
    });

    const productTest2 = new Product({
      name: "Producto Cypress 2",
      description: "Utilizado para probar multicompras.",
      details: "Detalles del producto de prueba 2",
      includes: "Manual y caja",
      condition: "Usado",
      region: "Global",
      company: "RetroBits Test Company",
      price: 250,
      stock: 5,
      category: testCategory._id,
      imagesUrl: ["/img/products/placeholder.svg"]
    });

    await Product.insertMany([productTest1, productTest2]);

    res.status(200).json({ message: "Productos de prueba insertados con éxito" });
  } catch (error) {
    next(error);
  }
};
