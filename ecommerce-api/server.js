import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './src/routes/index.js';
import dbConnection from './src/config/database.js';
import logger from './src/middlewares/logger.js';
import setupGlobalErrorHandlers from './src/middlewares/globalErrorHandler.js';
import errorHandler from './src/middlewares/errorHandler.js';

dotenv.config();

setupGlobalErrorHandlers();

export const app = express();

if (process.env.NODE_ENV !== "test") {
  dbConnection();
}

app.use(express.json());
app.use(logger);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.get('/', (req, res) => {
  res.send('Welcome to API!');
});

app.use('/api', routes);

routes.use((req, res) => {
  console.log('Route not found');
  res.status(404).json({ message: 'Route not found' });
});
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}

