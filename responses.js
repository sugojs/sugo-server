const codes = require("./codes");

/**
 * Implements an Ok response.
 *
 * @param {http.ServerResponse} res: NodeJS response object
 * @param {object} data: JSON data to be stringfied and sent
 */
const OkResponse = (res, data) => {
  res.status(codes.OK).json(data);
};

/**
 * Implements an Created response.
 *
 * @param {http.ServerResponse} res: NodeJS response object
 * @param {object} data: JSON data to be stringfied and sent
 */
const CreatedResponse = (res, data) => {
  res.status(codes.CREATED).json(data);
};

/**
 * Implements a Method Not Allowed Response
 *
 * @param {http.ServerResponse} res: NodeJS response object
 */
const MethodNotAllowedResponse = res => {
  res.status(codes.METHOD_NOT_ALLOWED).end();
};

module.exports = {
  OkResponse,
  CreatedResponse,
  MethodNotAllowedResponse
};
