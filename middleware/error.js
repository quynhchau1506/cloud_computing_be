// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  let status = 500;
  let message = 'Internal Server Error';
  
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    message = 'Request body too large. Please reduce image sizes.';
  } else if (err.message) {
    // Include actual error message in development
    message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  }
  
  res.status(status).json({ error: message });
};
