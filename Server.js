const http = require("http");
const Server = http.Server;
const SuGoRequest = require("./Request");
const SuGoResponse = require("./Response");
const assert = require("assert");

class SuGoServer extends Server {
  /**
   * @param {*} logger: Any object with the usual logging methods (log, debug, info, error)
   * @param {*} [options={}]
   * @param {*} [options.IncomingMessage=SuGoRequest]: NodeJS Http incoming message subclass
   * @param {*} [options.ServerResponse=SuGoResponse]: NodeJS Http Server response subclass
   */
  constructor(requestHandler, logger = console, httpServerOptions = {}) {
    httpServerOptions = Object.assign(
      {
        IncomingMessage: SuGoRequest,
        ServerResponse: SuGoResponse
      },
      httpServerOptions
    );
    assert(typeof requestHandler === "function", `The "requestHandler" must be a function. Value: ${requestHandler}`);
    super(httpServerOptions);
    this.middleware = [];
    this.httpServerOptions = httpServerOptions;
    this.logger = logger;
    this.usesDefaultErrorHandler = false;
    this.addListener("close", this.closeEventHandler)
      .addListener("error", this.errorEventHandler)
      .addListener("listening", this.listeningEventHandler)
      .addListener("request", async (req, res) => {
        req.setLogger(this.logger).parseUrl();
        res.setLogger(this.logger);
        res.id = req.id;
        res.path = req.path;
        res.method = req.method;
        await req.getBody(); // Adds body property to request
        for (const fn of this.middleware) {
          await fn(req, res);
        }
        await requestHandler(req, res); // User custom request Handler
      });
  }

  closeEventHandler() {
    if (this.logger) this.logger.log("The connection has been closed!");
  }

  errorEventHandler(err) {
    if (this.logger) this.logger.error(`An error has ocurred --> ${err.name} ${err.message} ${err.stack}`);
  }

  listeningEventHandler() {
    if (this.logger) this.logger.log(`Listening on port "${this.address().port}"`);
  }

  useMiddleware(fn) {
    this.middleware.push(fn);
  }
}
module.exports = SuGoServer;
