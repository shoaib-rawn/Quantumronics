const PG_ERRORS = {
  '23505': { status: 409, message: 'Duplicate value' },
  '23503': { status: 400, message: 'Related record does not exist' },
  '23514': { status: 400, message: 'Value not allowed' },
  '22P02': { status: 400, message: 'Invalid input format' },
  '22007': { status: 400, message: 'Invalid date format' },
  '22008': { status: 400, message: 'Date out of range' },
};

export const notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code && PG_ERRORS[err.code]) {
    const { status, message } = PG_ERRORS[err.code];
    return res.status(status).json({ error: message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
};
