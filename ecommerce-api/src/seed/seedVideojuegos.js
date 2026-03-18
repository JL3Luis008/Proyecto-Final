import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/category.js";
import Product from "../models/product.js";

dotenv.config();

const products = [
    // Consolas
    {
        name: "PlayStation 5",
        description: "Consola de última generación de Sony con tecnología Ray Tracing y SSD ultra rápido.",
        company: "Sony",
        price: 12999,
        stock: 15,
        imagesUrl: ["https://m.media-amazon.com/images/I/51051Hi9RPL._SL1000_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Xbox Series X",
        description: "La consola Xbox más potente de la historia, diseñada para juegos 4K nativos.",
        company: "Microsoft",
        price: 13999,
        stock: 10,
        imagesUrl: ["https://m.media-amazon.com/images/I/61JGkhqxHxL._SL1500_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Nintendo Switch OLED",
        description: "Consola híbrida con una vibrante pantalla OLED de 7 pulgadas.",
        company: "Nintendo",
        price: 8499,
        stock: 20,
        imagesUrl: ["https://m.media-amazon.com/images/I/61m668K5Q6L._SL1500_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "PlayStation 5 Digital Edition",
        description: "Versión sin lector de discos de la consola PS5.",
        company: "Sony",
        price: 10499,
        stock: 8,
        imagesUrl: ["https://m.media-amazon.com/images/I/51ebpT+p9vL._SL1000_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Xbox Series S",
        description: "Rendimiento de nueva generación en la Xbox más pequeña de la historia.",
        company: "Microsoft",
        price: 6999,
        stock: 25,
        imagesUrl: ["https://m.media-amazon.com/images/I/71RovvY5TmL._SL1500_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Nintendo Switch Lite",
        description: "Versión compacta y ligera de Nintendo Switch, diseñada para el juego portátil.",
        company: "Nintendo",
        price: 4999,
        stock: 30,
        imagesUrl: ["https://m.media-amazon.com/images/I/61JiI8K9JEL._SL1500_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Retro-Bit Super Retro-Cade",
        description: "Consola retro con más de 90 juegos clásicos incluidos.",
        company: "Retro-Bit",
        price: 1999,
        stock: 12,
        imagesUrl: ["https://m.media-amazon.com/images/I/71hM8p6iO5L._SL1500_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Sega Genesis Mini 2",
        description: "Réplica en miniatura de la consola clásica de Sega con 60 juegos.",
        company: "Sega",
        price: 2499,
        stock: 5,
        imagesUrl: ["https://m.media-amazon.com/images/I/61K1zWpG71L._SL1200_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "Steam Deck 512GB",
        description: "La computadora de mano para juegos más potente del mundo.",
        company: "Valve",
        price: 14500,
        stock: 7,
        imagesUrl: ["https://m.media-amazon.com/images/I/51rE8rU9PPL._SL1000_.jpg"],
        categoryName: "Consolas"
    },
    {
        name: "ASUS ROG Ally",
        description: "Consola portátil con Windows 11 y procesador AMD Ryzen Z1 Extreme.",
        company: "ASUS",
        price: 16999,
        stock: 4,
        imagesUrl: ["https://m.media-amazon.com/images/I/71wM9U9z86L._SL1500_.jpg"],
        categoryName: "Consolas"
    },
    // Videojuegos
    {
        name: "God of War Ragnarok",
        description: "Acompaña a Kratos y Atreus en un viaje épico a través de los nueve reinos.",
        company: "Sony Interactive Entertainment",
        price: 1499,
        stock: 50,
        imagesUrl: ["https://m.media-amazon.com/images/I/81IAn-v8W9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Halo Infinite",
        description: "Conviértete en el Jefe Maestro y salva la humanidad en el anillo Zeta Halo.",
        company: "Xbox Game Studios",
        price: 1199,
        stock: 40,
        imagesUrl: ["https://m.media-amazon.com/images/I/81269FhO6RL._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "The Legend of Zelda: Tears of the Kingdom",
        description: "Explora las tierras y los cielos de Hyrule en esta secuela épica.",
        company: "Nintendo",
        price: 1399,
        stock: 60,
        imagesUrl: ["https://m.media-amazon.com/images/I/81S9pXjHj9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Marvel's Spider-Man 2",
        description: "Balancéate por Nueva York como Peter Parker y Miles Morales.",
        company: "Sony Interactive Entertainment",
        price: 1599,
        stock: 45,
        imagesUrl: ["https://m.media-amazon.com/images/I/81IAn-v8W9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Starfield",
        description: "El primer universo nuevo en 25 años de Bethesda Game Studios.",
        company: "Bethesda Game Studios",
        price: 1299,
        stock: 35,
        imagesUrl: ["https://m.media-amazon.com/images/I/8157G8mF7DL._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Super Mario Odyssey",
        description: "Únete a Mario en una aventura 3D masiva por todo el mundo.",
        company: "Nintendo",
        price: 1199,
        stock: 55,
        imagesUrl: ["https://m.media-amazon.com/images/I/919YF9lW-JL._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Elden Ring",
        description: "Un juego de rol y acción de fantasía épica de FromSoftware.",
        company: "Bandai Namco",
        price: 1499,
        stock: 20,
        imagesUrl: ["https://m.media-amazon.com/images/I/81S9pXjHj9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Hogwarts Legacy",
        description: "Vive lo no escrito en este RPG de acción de mundo abierto en el mundo de Harry Potter.",
        company: "Warner Bros. Games",
        price: 1299,
        stock: 40,
        imagesUrl: ["https://m.media-amazon.com/images/I/81IAn-v8W9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Resident Evil 4 Remake",
        description: "La supervivencia es solo el comienzo en esta obra maestra del terror reimaginada.",
        company: "Capcom",
        price: 1399,
        stock: 25,
        imagesUrl: ["https://m.media-amazon.com/images/I/81IAn-v8W9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    },
    {
        name: "Final Fantasy XVI",
        description: "Una fantasía oscura épica donde el destino del mundo está en manos de los Eikons.",
        company: "Square Enix",
        price: 1499,
        stock: 15,
        imagesUrl: ["https://m.media-amazon.com/images/I/81IAn-v8W9L._SL1500_.jpg"],
        categoryName: "Videojuegos"
    }
];

async function seed() {
    try {
        const dbURI = process.env.MONGODB_URI;
        console.log("Conectando a MongoDB...");
        await mongoose.connect(dbURI);
        console.log("Conectado con éxito.");

        // Limpiar base de datos (opcional, pero recomendado para semillas limpias)
        // console.log("Limpiando colecciones anteriores...");
        // await Category.deleteMany({});
        // await Product.deleteMany({});

        // Crear categorías si no existen
        const categoriesToCreate = [
            { name: "Consolas", description: "Hardware de videojuegos para el hogar y portátiles." },
            { name: "Videojuegos", description: "Software de entretenimiento interactivo." }
        ];

        const categoryDocs = {};
        for (const cat of categoriesToCreate) {
            let category = await Category.findOne({ name: cat.name });
            if (!category) {
                category = new Category(cat);
                await category.save();
                console.log(`Categoría creada: ${cat.name}`);
            } else {
                console.log(`Categoría ya existe: ${cat.name}`);
            }
            categoryDocs[cat.name] = category;
        }

        // Insertar productos
        let count = 0;
        for (const prodData of products) {
            const existingProduct = await Product.findOne({ name: prodData.name });
            if (!existingProduct) {
                const { categoryName, ...productFields } = prodData;
                const product = new Product({
                    ...productFields,
                    category: categoryDocs[categoryName]._id
                });
                await product.save();
                console.log(`Producto insertado: ${prodData.name}`);
                count++;
            } else {
                console.log(`Producto ya existe: ${prodData.name}`);
            }
        }

        console.log(`Proceso de semilla completado. ${count} nuevos productos insertados.`);
    } catch (error) {
        console.error("Error durante el proceso de semilla:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Desconectado de MongoDB.");
    }
}

seed();
