// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  console.error(err);
  let status = 500;
  let message = 'Internal Server Error';
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }
  res.status(status).json({ error: message });
};
