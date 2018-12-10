const Server = require("../Server");

const server = new Server();

server.router.route("/error").get((req, res, next) => {
  throw new Error("Hola hola");
});

server.useDefaultErrorHandler();

server.listen(5000);
