const Server = require("./Server");
const Request = require("./Request");
const Response = require("./Response");
const createServer = requestListener => new Server(requestListener);

module.exports = {
  Server,
  Request,
  Response,
  createServer
};
