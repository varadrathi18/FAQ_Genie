const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = 'INTERNAL_ERROR';

  // Malformed JSON error from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload';
    code = 'BAD_REQUEST';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    code = 'VALIDATION_ERROR';
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    code = 'DUPLICATE_KEY_ERROR';
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
    code = 'CAST_ERROR';
  }

  res.status(statusCode).json({
    error: {
      message: message,
      code: code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: {
      message: 'Resource not found',
      code: 'NOT_FOUND',
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
