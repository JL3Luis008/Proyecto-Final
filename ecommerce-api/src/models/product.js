import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 1,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  imagesUrl: [{
    type: String,
    default: 'https://placehold.co/800x600.png',
    trim: true,
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;


/* import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  brandId: {
    type: String,
    required: true,
    trim: true,
    // si luego quieres relacionarlo:
    // ref: 'Brand'
  },

  categoryId: {
    type: String,
    required: true,
    trim: true,
    // ref: 'Category'
  },

  condition: {
    type: String,
    enum: ['Nuevo', 'Usado', 'Reacondicionado'],
    required: true,
  },

  region: {
    type: String,
    enum: ['NTSC', 'PAL', 'NTSC-J'],
    required: true,
  },

  releaseYear: {
    type: Number,
    min: 1970,
    max: new Date().getFullYear(),
  },

  price: {
    type: Number,
    required: true,
    min: 1,
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
  },

  includes: {
    type: [String],
    default: [],
  },

  imagesUrl: {
    type: [String],
    default: ['/img/products/placeholder.png'],
  },

  tags: {
    type: [String],
    index: true,
    default: [],
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },

  reviewsCount: {
    type: Number,
    min: 0,
    default: 0,
  },

}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);
 */

