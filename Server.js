const http = require("http");
const Server = http.Server;
const SuGoRequest = require("./Request");
const SuGoResponse = require("./Response");
const Router = require("router");
const finalhandler = require("finalhandler");

class SuGoServer extends Server {
  constructor(router = new Router(), logger = console) {
    super({
      IncomingMessage: SuGoRequest,
      ServerResponse: SuGoResponse
    });
    this.router = router;
    this.logger = logger;
    this.on("close", this.closeEventHandler)
      .on("error", this.errorEventHandler)
      .on("listening", this.listeningEventHandler)
      .on("request", this.requestEventHandler);
  }
  closeEventHandler() {
    this.logger.log("The connection has been closed!");
  }

  errorEventHandler(err) {
    this.logger.error(
      `An error has ocurred --> ${err.name} ${err.message} ${err.stack}`
    );
  }

  listeningEventHandler() {
    this.logger.log(`Listening on port "${this.address().port}"`);
  }

  requestEventHandler(req, res) {
    req.on("end", () => {
      /** The default handler already makes all the setup so we just pass the router handler */
      this.router(req, res, finalhandler(req, res));
    });
  }
}
module.exports = SuGoServer;
