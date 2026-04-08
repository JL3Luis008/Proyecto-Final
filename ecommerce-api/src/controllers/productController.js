import Product from '../models/product.js';
import Category from '../models/category.js';
import errorHandler from '../middlewares/errorHandler.js';

// Helper to get all descendant category IDs
async function getAllCategoryDescendants(categoryId) {
  let descendants = [];
  const children = await Category.find({ parentCategory: categoryId }).select("_id");
  
  for (const child of children) {
    descendants.push(child._id);
    const subDescendants = await getAllCategoryDescendants(child._id);
    descendants = [...descendants, ...subDescendants];
  }
  return descendants;
}



async function getProducts(req, res, next) {
  try {
    // req.params
    // req.query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const totalResult = await Product.countDocuments();
    const totalPages = Math.ceil(totalResult / limit);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults: totalResult,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      }
    });
  } catch (error) {
    next(error);
  }
}
async function getProductById(req, res, next) {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}

async function getProductByCategory(req, res, next) {
  try {
    const id = req.params.idCategory;
    const products = await Product
      .find({ category: id })
      .populate('category')
      .sort({ name: 1 });
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found on this category' });
    }
    res.json(products);
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const {
      name,
      description,
      details,
      includes,
      condition,
      region,
      company,
      price,
      stock,
      imagesUrl,
      category,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });
    if (price === undefined) return res.status(400).json({ error: "Price is required" });
    if (stock === undefined) return res.status(400).json({ error: "Stock is required" });

    const newProduct = await Product.create({
      name,
      description,
      details,
      includes,
      condition,
      region,
      company,
      price,
      stock,
      imagesUrl,
      category,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
}
async function updateProduct(req, res, next) {
  try {
    const id = req.params.id;
    const {
      name,
      description,
      details,
      includes,
      condition,
      region,
      company,
      price,
      stock,
      imagesUrl,
      category,
    } = req.body;

    if (!name) return res.status(400).json({ error: "Name is required" });

    const updatedProduct = await Product.findByIdAndUpdate(id,
      {
        name,
        description,
        details,
        includes,
        condition,
        region,
        company,
        price,
        stock,
        imagesUrl,
        category,
      },
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
}
async function deleteProduct(req, res, next) {
  try {
    const id = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}


async function searchProducts(req, res, next) {
  try {
    const {
      q,
      category,
      company,
      minPrice,
      maxPrice,
      inStock,
      sort,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    let filters = {};

    if (q) {
      filters.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      const descendants = await getAllCategoryDescendants(category);
      filters.category = { $in: [category, ...descendants] };
    }

    if (company) {
      filters.company = company;
    }


    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }
    const bool = Boolean(inStock);
    if (inStock === 'true') {
      filters.stock = { $gt: 0 };
    } else {
      filters.stock = { $gte: 0 };
    }

    let sortOptions = {};
    if (sort) {
      const sortOrder = order === "desc" ? -1 : 1;
      sortOptions[sort] = sortOrder;
    } else {
      sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filters)
      .populate("category")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalResults = await Product.countDocuments(filters);
    const totalPages = Math.ceil(totalResults / parseInt(limit));

    res.status(200).json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
      filters: {
        searchTerm: q || null,
        category: category || null,
        priceRange: {
          min: minPrice ? parseFloat(minPrice) : null,
          max: maxPrice ? parseFloat(maxPrice) : null,
        },
        inStock: inStock === "true",
        company: company || null,
        sort: sort || "createdAt",
        order: order || "desc",
      },
    });
  } catch (error) {
    next(error);
  }
}

async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // URL to access the file (relative to the server)
    const imageUrl = `/uploads/products/${req.file.filename}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    next(error);
  }
}


export {
  getProducts,
  getProductById,
  getProductByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  uploadProductImage,
}
