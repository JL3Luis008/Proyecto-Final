import mongoose from "mongoose";
import Category from "../models/category.js";
import Product from "../models/product.js";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  const dbURI = process.env.MONGODB_URI;

  await mongoose.connect(dbURI, {});

  // Categorías principales
  const mainCategories = [
    { name: "Consolas", description: "Consaolas de videojuegos", parent: "Consolas" },
    { name: "Juegos de video", description: "Juegos para consolas", parent: "Juegos" },
    { name: "Accesorios y perifericos", description: "accesorios para consolas", parent: "Accesorios y perifericos" },
    { name: "Coleccionables", description: "perifericos para consolas", parent: "Coleccionables" },
    { name: "Otros", description: "otros para consolas", parent: "Otros" },

  ];

  // Subcategorías
  const subCategories = [
    { name: "Sony Playstation", description: "consolas de Sony Playstation company", parent: "Consolas" },
    { name: "Sony Playstation", description: "Juegos de Sony Playstation company", parent: "Juegos de video" },
    { name: "Sony Playstation", description: "accesorios y perifericos de Sony Playstation company", parent: "Accesorios y perifericos" },
    { name: "Nintendo", description: "Consolas de Nintendo company", parent: "Consolas" },
    { name: "Nintendo", description: "Juegos de Nintendo company", parent: "Juegos de video" },
    { name: "Nintendo", description: "accesorios y perifericos de Nintendo company", parent: "Accesorios y perifericos" },
    { name: "Xbox", description: "Consolas de Xbox company", parent: "Consolas" },
    { name: "Xbox", description: "Juegos de Xbox company", parent: "Juegos de video" },
    { name: "Xbox", description: "accesorios y perifericos de Xbox company", parent: "Accesorios y perifericos" },
    { name: "Sega", description: "Consolas de Sega company", parent: "Consolas" },
    { name: "Sega", description: "Juegos de Sega company", parent: "Juegos de video" },
    { name: "Sega", description: "accesorios y perifericos de Sega company", parent: "Accesorios y perifericos" },
    { name: "otros", description: "Consolas de otros ", parent: "Consolas" },
    { name: "otros", description: "Juegos de otros", parent: "Juegos de video" },
    { name: "otros", description: "accesorios y perifericos de otros", parent: "Accesorios y perifericos" },
  ];

  // Limpiar colecciones
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Insertar categorías principales
  const categories = {};
  for (const cat of mainCategories) {
    const category = new Category(cat);
    await category.save();
    categories[cat.name] = category;
  }

  // Insertar subcategorías
  const subCatDocs = {};
  for (const sub of subCategories) {
    const parent = categories[sub.parent];
    const subCat = new Category({
      name: sub.name,
      description: sub.description,
      parentCategory: parent._id,
    });
    await subCat.save();
    subCatDocs[sub.name] = subCat;
  }



  // Productos de prueba
  const productsData = [
  {
    name: "The Legend of Zelda: Ocarina of Time",
    description: "Aventura clásica de Nintendo 64.",
    price: 1200,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/5/57/The_Legend_of_Zelda_Ocarina_of_Time.jpg"],
    category: subCatDocs["Nintendo"]._id,
  },
  {
    name: "Super Mario World",
    description: "Plataformas icónico de Super Nintendo.",
    price: 900,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png"],
    category: subCatDocs["Nintendo"]._id,
  },
  {
    name: "Halo: Combat Evolved",
    description: "Shooter clásico de Xbox original.",
    price: 850,
    stock: 4,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/b/bc/Halo_-_Combat_Evolved_%28Xbox%29.jpg"],
    category: subCatDocs["Xbox"]._id,
  },
  {
    name: "God of War II",
    description: "Acción y aventura para PlayStation 2.",
    price: 950,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/3/31/God_of_War_2_cover.jpg"],
    category: subCatDocs["Sony Playstation"]._id,
  },
  {
    name: "Sonic the Hedgehog 2",
    description: "Plataformas clásico de Sega Genesis.",
    price: 700,
    stock: 5,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/6/60/Sonic2_box.jpg"],
    category: subCatDocs["Sega"]._id,
  },
  {
    name: "Gears of War",
    description: "Shooter en tercera persona exclusivo de Xbox 360.",
    price: 880,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/5/57/Gears_of_War_cover_art.jpg"],
    category: subCatDocs["Xbox"]._id,
  },
  {
    name: "Gran Turismo 4",
    description: "Simulador de conducción para PlayStation 2.",
    price: 780,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/7/79/Gran_Turismo_4.jpg"],
    category: subCatDocs["Sony Playstation"]._id,
  },
  {
    name: "Donkey Kong Country",
    description: "Plataformas clásico de Super Nintendo.",
    price: 820,
    stock: 4,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/4/4f/Donkey_Kong_Country_SNES_cover.png"],
    category: subCatDocs["Nintendo"]._id,
  },
  {
    name: "Phantasy Star IV",
    description: "RPG clásico de Sega Genesis.",
    price: 1100,
    stock: 1,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/7/7c/Phantasy_Star_IV.jpg"],
    category: subCatDocs["Sega"]._id,
  },
  {
    name: "Forza Horizon 3",
    description: "Juego de carreras de mundo abierto para Xbox One.",
    price: 990,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/4/4b/Forza_Horizon_3_cover.jpg"],
    category: subCatDocs["Xbox"]._id,
  },
  {
    name: "The Legend of Zelda: Ocarina of Time",
    description: "Aventura clásica de Nintendo 64.",
    price: 1200,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/5/57/The_Legend_of_Zelda_Ocarina_of_Time.jpg"],
    category: subCatDocs["Nintendo"]._id,
  },
  {
    name: "Super Mario World",
    description: "Plataformas icónico de Super Nintendo.",
    price: 900,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/3/32/Super_Mario_World_Coverart.png"],
    category: subCatDocs["Nintendo"]._id,
  },
  {
    name: "Halo: Combat Evolved",
    description: "Shooter clásico de Xbox original.",
    price: 850,
    stock: 4,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/b/bc/Halo_-_Combat_Evolved_%28Xbox%29.jpg"],
    category: subCatDocs["Xbox"]._id,
  },
  {
    name: "God of War II",
    description: "Acción y aventura para PlayStation 2.",
    price: 950,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/3/31/God_of_War_2_cover.jpg"],
    category: subCatDocs["Sony Playstation"]._id,
  },
  {
    name: "Sonic the Hedgehog 2",
    description: "Plataformas clásico de Sega Genesis.",
    price: 700,
    stock: 5,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/6/60/Sonic2_box.jpg"],
    category: subCatDocs["Sega"]._id,
  },
  {
    name: "Gears of War",
    description: "Shooter en tercera persona exclusivo de Xbox 360.",
    price: 880,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/5/57/Gears_of_War_cover_art.jpg"],
    category: subCatDocs["Xbox"]._id,
  },
  {
    name: "Gran Turismo 4",
    description: "Simulador de conducción para PlayStation 2.",
    price: 780,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/7/79/Gran_Turismo_4.jpg"],
    category: subCatDocs["Sony Playstation"]._id,
  },
  {
    name: "Donkey Kong Country",
    description: "Plataformas clásico de Super Nintendo.",
    price: 820,
    stock: 4,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/4/4f/Donkey_Kong_Country_SNES_cover.png"],
    category: subCatDocs["Nintendo"]._id,
  },
  {
    name: "Phantasy Star IV",
    description: "RPG clásico de Sega Genesis.",
    price: 1100,
    stock: 1,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/7/7c/Phantasy_Star_IV.jpg"],
    category: subCatDocs["Sega"]._id,
  },
  {
    name: "Forza Horizon 3",
    description: "Juego de carreras de mundo abierto para Xbox One.",
    price: 990,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/en/4/4b/Forza_Horizon_3_cover.jpg"],
    category: subCatDocs["Xbox"]._id,
  },
  {
    name: "Game Boy",
    description: "Consola portátil clásica de Nintendo.",
    price: 1500,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/f/f4/Game-Boy-FL.jpg"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "PlayStation 2",
    description: "Consola doméstica de sexta generación de Sony.",
    price: 2200,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/3/39/PS2-SCPH-30001.png"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "Xbox 360",
    description: "Consola de séptima generación de Microsoft.",
    price: 2500,
    stock: 4,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/e/e4/Xbox-360-Pro-wController.jpg"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "Nintendo 64",
    description: "Consola clásica de Nintendo con cartuchos.",
    price: 2800,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/0/02/N64-Console-Set.png"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "Sega Genesis",
    description: "Consola de 16 bits de Sega conocida como Mega Drive.",
    price: 2600,
    stock: 1,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/6/6a/Sega-Genesis-Mk2-6button.jpg"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "PlayStation 1",
    description: "Primera consola PlayStation que popularizó el CD.",
    price: 2000,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/9/95/PSX-Console-wController.jpg"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "Nintendo Wii",
    description: "Consola de Nintendo con controles por movimiento.",
    price: 2300,
    stock: 5,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/1/14/Wii-console.png"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "Xbox One",
    description: "Consola de octava generación de Microsoft.",
    price: 4200,
    stock: 2,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/2/2a/Xbox-One-Console-Set.png"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "Game Boy Advance",
    description: "Consola portátil de Nintendo sucesora de Game Boy.",
    price: 1800,
    stock: 4,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/7/7c/Game-Boy-Advance-White.png"],
    category: subCatDocs["Consolas"]._id,
  },
  {
    name: "PlayStation 4",
    description: "Consola de octava generación de Sony.",
    price: 5000,
    stock: 3,
    imagesUrl: ["https://upload.wikimedia.org/wikipedia/commons/0/05/PlayStation_4_Original.png"],
    category: subCatDocs["Consolas"]._id,
  }
];

  for (const prod of productsData) {
    const product = new Product(prod);
    await product.save();
  }

  console.log("Datos de prueba insertados correctamente.");
  await mongoose.disconnect();
}

seed();
