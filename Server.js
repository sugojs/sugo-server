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
    const self = this;
    this.middleware = [];
    this.httpServerOptions = httpServerOptions;
    this.logger = logger;
    this.usesDefaultErrorHandler = false;
    this.handleError = this.defaultErrorHandler;
    this.addListener("close", this.closeEventHandler)
      .addListener("error", this.errorEventHandler)
      .addListener("listening", this.listeningEventHandler)
      .addListener("request", async (req, res) => {
        try {
          req.setLogger(self.logger).parseUrl();
          res.setLogger(self.logger);
          res.id = req.id;
          res.path = req.path;
          res.method = req.method;
          await req.getBody(); // Adds body property to request
          for (const fn of self.middleware) {
            await fn(req, res);
          }
          await requestHandler(req, res); // User custom request Handler
        } catch (err) {
          self.handleError(req, res, err);
        }
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

  defaultErrorHandler(req, res, err) {
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
    }
  }

  setErrorHandler(fn) {
    this.handleError = fn;
  }
}
module.exports = SuGoServer;
