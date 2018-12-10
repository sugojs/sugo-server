const http = require("http");
const Server = http.Server;
const SuGoRequest = require("./Request");
const SuGoResponse = require("./Response");
const Router = require("router");
const finalhandler = require("finalhandler");

class SuGoServer extends Server {
  constructor(router = new Router(), logger = console, options = {}) {
    options = Object.assign(
      {
        IncomingMessage: SuGoRequest,
        ServerResponse: SuGoResponse
      },
      options
    );
    super(options);
    this.router = router;
    this.logger = logger;
    this.usesDefaultErrorHandler = false;
    this.addListener("close", this.closeEventHandler)
      .addListener("error", this.errorEventHandler)
      .addListener("listening", this.listeningEventHandler)
      .addListener("request", this.requestEventHandler);
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

  defaultErrorHandler(err, req, res, next) {
    /* If the error object has a handle method we use it */
    if (typeof err.handle === "function") {
      err.handle(req, res);
    } else {
      const json = {
        status: err.status || 500,
        name: err.name || err.constructor.name,
        code: err.code || "N/A",
        message: err.message || "Unexpected Error"
      };
      if (err.stack) {
        json.stack = err.stack;
      }
      res.status(json.status).json(json);
      if (next) {
        next();
      }
    }
  }

  useDefaultErrorHandler() {
    const assert = require("assert");
    assert.equal(this.usesDefaultErrorHandler, false);
    this.router.use(this.defaultErrorHandler.bind(this));
  }

  requestEventHandler(req, res) {
    /* We set up the same logger in the server that in the request and response  */
    req.setLogger(this.logger);
    res.setLogger(this.logger);
    req.on("end", () => {
      /** The default handler already makes all the setup so we just pass the router handler */
      this.router(req, res, finalhandler(req, res));
    });
  }
}
module.exports = SuGoServer;
