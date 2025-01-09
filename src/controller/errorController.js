export default (err, req, res, next) => {
  console.log(err);

  if (err.severity && err.code) {
    err.statusCode =
      err.code.startsWith('22') || err.code.startsWith('23') ? 400 : 500;
  } else err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  return res.status(err.statusCode).json({
    message: err.message,
    status: err.status,
    error: err,
    stack: err.stack,
  });
};
