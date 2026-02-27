import { afterAll, afterEach, beforeAll } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod;

/**
 * Conectar a la base de datos en memoria antes de todos los tests.
 */
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Evitar reconexiones accidentales si ya está conectado
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(uri);
    }
});

/**
 * Limpiar todas las colecciones después de cada test para asegurar aislamiento.
 */
afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany();
        }
    }
});

/**
 * Desconectar y cerrar el servidor después de todos los tests.
 */
afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
    }
});
