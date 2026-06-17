const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginatedResponse = (res, message, data, meta) => {
  return res.status(200).json({ success: true, message, data, meta });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
