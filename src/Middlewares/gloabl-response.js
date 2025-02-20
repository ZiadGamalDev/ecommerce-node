export const globalResponse = (err, req, res, next) => {
  if (err) {
    console.log(err);
    res.status(err.cause || 500).json({
      success: false,
      message: "Catch error",
      error_message: err.message,
      stack: err.stack,
    });
    next();
  }
};
