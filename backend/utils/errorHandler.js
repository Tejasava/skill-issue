module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err);
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    error: err.stack || null
  });
};
