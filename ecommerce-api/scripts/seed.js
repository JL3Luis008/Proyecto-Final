import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../src/models/user.js';
import Category from '../src/models/category.js';
import Product from '../src/models/product.js';

dotenv.config();

const SEED_ALLOW_RESET = process.env.SEED_ALLOW_RESET === 'true';

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const usersData = [
  {
    displayName: 'Admin Master',
    email: 'admin@ecommerce.com',
    password: 'AdminPassword123!',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
  {
    displayName: 'System Administrator',
    email: 'sysadmin@ecommerce.com',
    password: 'SysAdminPassword123!',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SysAdmin',
  },
  {
    displayName: 'John Doe',
    email: 'john@example.com',
    password: 'UserPassword123!',
    role: 'customer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  },
  {
    displayName: 'Jane Smith',
    email: 'jane@example.com',
    password: 'UserPassword123!',
    role: 'customer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
  },
  {
    displayName: 'Test Buyer',
    email: 'test@example.com',
    password: 'UserPassword123!',
    role: 'customer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
  },
];

const categoriesData = [
  { name: 'Consolas', description: 'Hardware de videojuegos para el hogar y portátiles.' },
  { name: 'Videojuegos', description: 'Software de entretenimiento interactivo.' },
  { name: 'Accesorios', description: 'Periféricos y complementos para gaming.' },
  { name: 'Coleccionables', description: 'Figuras y objetos de colección de tus franquicias favoritas.' }
];

const productsData = [
  // --- NINTENDO ---
  {
    name: "NES (Nintendo Entertainment System)",
    description: "La consola que revivió la industria. Incluye 2 controles originales.",
    details: "Salida RF y RCA, compatible con cartuchos originales.",
    includes: "Consola, 2 Controles, Cable AV, Adaptador de corriente.",
    condition: "Usado - Excelente",
    region: "NTSC",
    company: "Nintendo",
    price: 3500,
    stock: 5,
    imagesUrl: ["https://m.media-amazon.com/images/I/81mZf9iI3RL._SL1500_.jpg"],
    categoryName: "Consolas",
    rating: 4.8,
    numReviews: 15
  },
  {
    name: "Super Mario Bros. 3 (NES)",
    description: "Considerado uno de los mejores juegos de la historia de Nintendo.",
    details: "Cartucho original con etiqueta en perfecto estado.",
    includes: "Solo cartucho.",
    condition: "Usado",
    region: "NTSC",
    company: "Nintendo",
    price: 950,
    stock: 12,
    imagesUrl: ["https://m.media-amazon.com/images/I/919YF9lW-JL._SL1500_.jpg"],
    categoryName: "Videojuegos",
    rating: 5,
    numReviews: 40
  },
  {
    name: "Super Nintendo (SNES)",
    description: "La cumbre de los 16-bits con los mejores RPGs de la historia.",
    details: "Consola original con un control y juego de cables.",
    includes: "Consola, 1 Control, Cable AV, Transformador.",
    condition: "Usado - Bueno",
    region: "NTSC",
    company: "Nintendo",
    price: 2800,
    stock: 3,
    imagesUrl: ["https://m.media-amazon.com/images/I/81S9pXjHj9L._SL1500_.jpg"],
    categoryName: "Consolas",
    rating: 4.9,
    numReviews: 22
  },
  {
    name: "The Legend of Zelda: A Link to the Past",
    description: "La aventura definitiva de Link en 16 bits.",
    details: "Cartucho original, batería de guardado recién cambiada.",
    includes: "Cartucho y caja protectora de acrílico.",
    condition: "Usado - Excelente",
    region: "NTSC",
    company: "Nintendo",
    price: 1800,
    stock: 4,
    imagesUrl: ["https://m.media-amazon.com/images/I/81IAn-v8W9L._SL1500_.jpg"],
    categoryName: "Videojuegos",
    rating: 5,
    numReviews: 35
  },
  {
    name: "Nintendo 64 (Clear Blue)",
    description: "Edición especial transparente. La consola del multijugador local.",
    details: "Incluye Expansion Pak instalado.",
    includes: "Consola, Control Atomic Purple, Cables.",
    condition: "Usado",
    region: "NTSC",
    company: "Nintendo",
    price: 3200,
    stock: 2,
    imagesUrl: ["https://m.media-amazon.com/images/I/61m668K5Q6L._SL1500_.jpg"],
    categoryName: "Consolas",
    rating: 4.7,
    numReviews: 18
  },
  {
    name: "Game Boy Color (Yellow)",
    description: "La mítica consola portátil de Nintendo en su vibrante color amarillo.",
    details: "Pantalla sin rayones, tapa de pilas original incluida.",
    includes: "Consola Portátil.",
    condition: "Usado - Excelente",
    region: "Global",
    company: "Nintendo",
    price: 2100,
    stock: 6,
    imagesUrl: ["https://m.media-amazon.com/images/I/61JiI8K9JEL._SL1500_.jpg"],
    categoryName: "Consolas",
    rating: 4.9,
    numReviews: 28
  },
  {
    name: "Pokemon Yellow Version",
    description: "Hazte con todos con Pikachu siguiéndote en el mapa.",
    details: "Cartucho original con batería nueva.",
    includes: "Cartucho.",
    condition: "Usado",
    region: "NTSC",
    company: "Nintendo",
    price: 2500,
    stock: 3,
    imagesUrl: ["https://m.media-amazon.com/images/I/51ebpT+p9vL._SL1000_.jpg"],
    categoryName: "Videojuegos",
    rating: 5,
    numReviews: 50
  },

  // --- SEGA ---
  {
    name: "Sega Genesis (Model 1)",
    description: "Sega hace lo que Nintendon't. La consola de 16 bits de Sega.",
    details: "Primer modelo con salida de audífonos frontal.",
    includes: "Consola, Control original de 3 botones, Cables.",
    condition: "Usado",
    region: "NTSC",
    company: "Sega",
    price: 2200,
    stock: 4,
    imagesUrl: ["https://m.media-amazon.com/images/I/61K1zWpG71L._SL1200_.jpg"],
    categoryName: "Consolas",
    rating: 4.6,
    numReviews: 14
  },
  {
    name: "Sonic the Hedgehog (Sega Genesis)",
    description: "El debut del erizo más rápido del mundo.",
    details: "Caja original y manual incluidos (CIB).",
    includes: "Cartucho, Caja, Manual.",
    condition: "Completo en Caja",
    region: "NTSC",
    company: "Sega",
    price: 1200,
    stock: 5,
    imagesUrl: ["https://m.media-amazon.com/images/I/71hM8p6iO5L._SL1500_.jpg"],
    categoryName: "Videojuegos",
    rating: 4.8,
    numReviews: 20
  },
  {
    name: "Sega Dreamcast",
    description: "Adelantada a su tiempo, la última consola de Sega.",
    details: "Lector funcionando perfectamente, incluye VMU.",
    includes: "Consola, Control, VMU, Cables.",
    condition: "Usado - Muy Bueno",
    region: "NTSC",
    company: "Sega",
    price: 3800,
    stock: 2,
    imagesUrl: ["https://m.media-amazon.com/images/I/51rE8rU9PPL._SL1000_.jpg"],
    categoryName: "Consolas",
    rating: 4.9,
    numReviews: 16
  },

  // --- SONY ---
  {
    name: "PlayStation 1 (Classic Gray)",
    description: "La revolución de los CDs y los gráficos 3D.",
    details: "Modelo original SCPH-1001.",
    includes: "Consola, 1 Control, Memory Card, Cables.",
    condition: "Usado",
    region: "NTSC",
    company: "Sony",
    price: 1500,
    stock: 8,
    imagesUrl: ["https://m.media-amazon.com/images/I/51051Hi9RPL._SL1000_.jpg"],
    categoryName: "Consolas",
    rating: 4.7,
    numReviews: 25
  },
  {
    name: "Metal Gear Solid (PS1)",
    description: "Una obra maestra del sigilo y la narrativa cinematográfica.",
    details: "Versión de 2 discos en caja original.",
    includes: "2 Discos de juego, Caja original.",
    condition: "Usado",
    region: "NTSC",
    company: "Konami",
    price: 1400,
    stock: 6,
    imagesUrl: ["https://images.cdn1.buscalibre.com/fit-in/360x360/e6/bd/e6bdad2b72c203a0c1d3764da4f009ef.jpg"],
    categoryName: "Videojuegos",
    rating: 5,
    numReviews: 32
  },
  {
    name: "PlayStation 2 (Slim Black)",
    description: "La consola más vendida de la historia.",
    details: "Modelo Slim con lector láser nuevo.",
    includes: "Consola, Control DualShock 2, Memory Card, Cables.",
    condition: "Usado - Refabricado",
    region: "NTSC",
    company: "Sony",
    price: 1900,
    stock: 10,
    imagesUrl: ["https://m.media-amazon.com/images/I/51ebpT+p9vL._SL1000_.jpg"],
    categoryName: "Consolas",
    rating: 4.9,
    numReviews: 45
  },
  {
    name: "Grand Theft Auto: San Andreas (PS2)",
    description: "El mundo abierto definitivo de la era PS2.",
    details: "Incluye el mapa original de Los Santos.",
    includes: "Disco, Caja, Manual, Mapa.",
    condition: "Usado - Muy Bueno",
    region: "NTSC",
    company: "Rockstar Games",
    price: 650,
    stock: 15,
    imagesUrl: ["https://m.media-amazon.com/images/I/81269FhO6RL._SL1500_.jpg"],
    categoryName: "Videojuegos",
    rating: 5,
    numReviews: 60
  },
  {
    name: "Metal Gear Solid 3: Snake Eater",
    description: "La historia de origen de Big Boss en la jungla.",
    details: "Juego de culto para PS2 (y retro-compatible).",
    includes: "Disco y Caja.",
    condition: "Usado",
    region: "NTSC",
    company: "Sony Playstation",
    price: 800,
    stock: 1,
    imagesUrl: ["https://images.cdn1.buscalibre.com/fit-in/360x360/e6/bd/e6bdad2b72c203a0c1d3764da4f009ef.jpg"],
    categoryName: "Videojuegos",
    rating: 5,
    numReviews: 12
  },

  // --- XBOX ---
  {
    name: "Original Xbox (Black)",
    description: "Poder puro y el nacimiento de Xbox Live.",
    details: "Disco duro de 10GB original, sin modificaciones.",
    includes: "Consola, Control 'Duke', Cables.",
    condition: "Usado",
    region: "NTSC",
    company: "Microsoft",
    price: 1800,
    stock: 4,
    imagesUrl: ["https://m.media-amazon.com/images/I/61JGkhqxHxL._SL1500_.jpg"],
    categoryName: "Consolas",
    rating: 4.5,
    numReviews: 10
  },
  {
    name: "Halo: Combat Evolved (Xbox)",
    description: "El juego que definió los shooters en consola.",
    details: "Primera edición 'Game of the Year'.",
    includes: "Disco, Caja.",
    condition: "Usado",
    region: "NTSC",
    company: "Microsoft",
    price: 550,
    stock: 8,
    imagesUrl: ["https://m.media-amazon.com/images/I/81269FhO6RL._SL1500_.jpg"],
    categoryName: "Videojuegos",
    rating: 4.8,
    numReviews: 25
  },

  // --- ACCESORIOS & COLECCIONABLES ---
  {
    name: "Mando GameCube (Indigo)",
    description: "El control preferido por los jugadores de Smash.",
    details: "Original de Nintendo, sticks en buen estado.",
    includes: "Control con cable.",
    condition: "Usado",
    region: "Global",
    company: "Nintendo",
    price: 850,
    stock: 7,
    imagesUrl: ["https://m.media-amazon.com/images/I/61m668K5Q6L._SL1500_.jpg"],
    categoryName: "Accesorios",
    rating: 4.9,
    numReviews: 15
  },
  {
    name: "Memory Card 1MB (PS1 Original)",
    description: "Indispensable para guardar tus partidas clásicas.",
    details: "Color gris original, 15 bloques de memoria.",
    includes: "Memory Card.",
    condition: "Usado",
    region: "Global",
    company: "Sony",
    price: 350,
    stock: 20,
    imagesUrl: ["https://m.media-amazon.com/images/I/51051Hi9RPL._SL1000_.jpg"],
    categoryName: "Accesorios",
    rating: 4.6,
    numReviews: 10
  },
  {
    name: "Figura Mario Retro (8-bits)",
    description: "Figura de colección estilo pixel art de Super Mario.",
    details: "Material PVC de alta calidad, 10cm de altura.",
    includes: "Figura y base.",
    condition: "Nuevo",
    region: "Global",
    company: "Nintendo",
    price: 450,
    stock: 15,
    imagesUrl: ["https://m.media-amazon.com/images/I/919YF9lW-JL._SL1500_.jpg"],
    categoryName: "Coleccionables",
    rating: 5,
    numReviews: 8
  }
];

async function seed() {
  try {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('--- Database Seeding Started ---');
    console.log('Conectando a MongoDB...');
    await mongoose.connect(dbURI);
    console.log('Conexión establecida correctamente.');

    if (SEED_ALLOW_RESET) {
      console.log('AVISO: SEED_ALLOW_RESET=true detectado. Limpiando colecciones...');
      await User.deleteMany({});
      await Category.deleteMany({});
      await Product.deleteMany({});
      console.log('Colecciones limpias.');
    }

    // 1. Seed Categories
    console.log('\nSembrando Categorías...');
    const categoryDocs = {};
    for (const cat of categoriesData) {
      let category = await Category.findOne({ name: cat.name });
      if (!category) {
        category = await Category.create(cat);
        console.log(`[CREATED] Categoría: ${cat.name}`);
      } else {
        console.log(`[EXISTS] Categoría: ${cat.name}`);
      }
      categoryDocs[cat.name] = category;
    }

    // 2. Seed Users
    console.log('\nSembrando Usuarios...');
    for (const userData of usersData) {
      const { password, ...otherData } = userData;
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const hashPasswordVal = await hashPassword(password);
        user = await User.create({
          ...otherData,
          hashPassword: hashPasswordVal,
        });
        console.log(`[CREATED] Usuario: ${userData.displayName} (${userData.role})`);
      } else {
        console.log(`[EXISTS] Usuario: ${userData.email}`);
      }
    }

    // 3. Seed Products
    console.log('\nSembrando Productos...');
    let productCount = 0;
    for (const prodData of productsData) {
      let product = await Product.findOne({ name: prodData.name });
      if (!product) {
        const { categoryName, ...fields } = prodData;
        const categoryId = categoryDocs[categoryName]?._id;
        
        if (!categoryId) {
          console.error(`[ERROR] Categoría "${categoryName}" no encontrada para el producto "${prodData.name}"`);
          continue;
        }

        product = await Product.create({
          ...fields,
          category: categoryId
        });
        console.log(`[CREATED] Producto: ${prodData.name}`);
        productCount++;
      } else {
        console.log(`[EXISTS] Producto: ${prodData.name}`);
      }
    }

    console.log('\n--- Seeding Completed successfully ---');
    console.log(`${Object.keys(categoryDocs).length} Categorías procesadas.`);
    console.log(`${usersData.length} Usuarios procesados.`);
    console.log(`${productCount} Productos nuevos insertados.`);

  } catch (error) {
    console.error('\n!!! Error durante el proceso de semilla !!!');
    console.error(error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión cerrada.');
    process.exit(0);
  }
}

seed();
