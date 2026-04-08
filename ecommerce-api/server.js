import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';
import logger from './src/middlewares/logger.js';
import setupGlobalErrorHandlers from './src/middlewares/globalErrorHandler.js';
import errorHandler from './src/middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial env loading logic
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: path.join(__dirname, '.env.production') });
}
dotenv.config(); // Fallback to .env or use existing environment variables (Render Dashboard)

setupGlobalErrorHandlers();

export const app = express();

if (process.env.NODE_ENV !== "test") {
  dbConnection();
}

app.use(express.json());
app.use(logger);
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : 'http://localhost:3000', credentials: true }));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

app.get('/', (req, res) => {
  res.send('Welcome to API!');
});

app.use('/api', routes);

routes.use((req, res) => {
  console.log('Route not found');
  res.status(404).json({ message: 'Route not found' });
});
app.use(errorHandler);

let server;

if (process.env.NODE_ENV !== "test") {
  server = app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}

// Graceful Shutdown Handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Closing HTTP server...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        process.exit(0);
      } catch (err) {
        console.error('Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

