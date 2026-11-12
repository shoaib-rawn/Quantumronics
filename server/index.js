import express from 'express';
import applicationsRouter from './routes/applications.js';
import logger from './middleware/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());
app.use(logger);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/applications', applicationsRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
