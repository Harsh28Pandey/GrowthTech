export const apiResponse = (res, statusCode, message, data = null, pagination = null) => {
  const payload = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
  };

  if (pagination !== null) {
    payload.pagination = pagination;
  }

  return res.status(statusCode).json(payload);
};

