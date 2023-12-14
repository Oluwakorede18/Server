// Response handler to handle all api responses
exports.responseHandler = (
  res,
  message,
  statusCode,
  success = false,
  data = null
) => {
  const response = {
    success,
    message,
  };
  // remove data property if data is null or undefined
  data != undefined || null ? (response.data = data) : "";

  res.status(statusCode).json(response);
};
