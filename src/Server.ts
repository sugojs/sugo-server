import * as http from "http";
const Server = http.Server;
import * as assert from "assert";
import { IError, ILogger } from "./Interfaces";
import SuGoRequest from "./Request";
import SuGoResponse from "./Response";

export type IHandler = (req: SuGoRequest, res: SuGoResponse) => void;
export type IErrorHandler = (
  req: SuGoRequest,
  res: SuGoResponse,
  err: IError
) => void;

export default class SuGoServer extends Server {
  public logger: ILogger = console;
  public middleware: IHandler[] = [];
  public handleError: IErrorHandler;

  constructor(requestHandler: IHandler, logger: ILogger = console) {
    super({
      IncomingMessage: SuGoRequest,
      ServerResponse: SuGoResponse
    });
    assert(
      typeof requestHandler === "function",
      `The "requestHandler" must be a function. Value: ${requestHandler}`
    );

    const self = this;
    this.handleError = this.defaultErrorHandler;
    this.addListener("close", this.closeEventHandler)
      .addListener("error", this.errorEventHandler)
      .addListener("listening", this.listeningEventHandler)
      .addListener("request", async (req: SuGoRequest, res: SuGoResponse) => {
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

  public closeEventHandler() {
    if (this.logger) {
      this.logger.log("The connection has been closed!");
    }
  }

  public errorEventHandler(err: IError) {
    if (this.logger) {
      this.logger.error(
        `An error has ocurred --> ${err.name} ${err.message} ${err.stack}`
      );
    }
  }

  public listeningEventHandler() {
    if (this.logger) {
      this.logger.log(`Listening on port "${this.address()}"`);
    }
  }

  public useMiddleware(fn: IHandler) {
    this.middleware.push(fn);
    return this;
  }

  public defaultErrorHandler(req: SuGoRequest, res: SuGoResponse, err: IError) {
    /* If the error object has a handle method we use it */
    if (typeof err.handle === "function") {
      err.handle(req, res);
    } else {
      const json = {
        code: err.code || "N/A",
        message: err.message || "Unexpected Error",
        name: err.name || err.constructor.name,
        stack: "",
        status: err.status || 500
      };
      if (err.stack) {
        json.stack = err.stack;
      }
      res.status(json.status).json(json);
    }
  }

  public setLogger(logger: ILogger) {
    this.logger = logger;
    return this;
  }

  public setErrorHandler(fn: IHandler) {
    this.handleError = fn;
    return this;
  }
}
module.exports = SuGoServer;
