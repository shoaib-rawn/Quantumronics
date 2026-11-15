import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import pool from './db/index.js';
import applicationsRouter from './routes/applications.js';
import notesRouter from './routes/notes.js';
import logger from './middleware/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import cors from 'cors';
const app = express();


app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());
app.use(logger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/applications', applicationsRouter);
app.use('/api', notesRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

pool
  .query('SELECT NOW()')
  .then(() => console.log('Connected to PostgreSQL'))
  .catch((err) => console.error('PostgreSQL connection failed:', err.message));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection failed:', err.message));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
