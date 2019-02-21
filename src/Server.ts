import * as http from 'http';
const Server = http.Server;
import * as assert from 'assert';
import { AddressInfo } from 'net';
import { IError, ILogger } from './Interfaces';
import SuGoRequest from './Request';
import SuGoResponse from './Response';

export type IHandler = (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => any;
export type IErrorHandler = (req: SuGoRequest, res: SuGoResponse, err: IError) => any;
export type INextFunction = () => any;
export * from './Interfaces';

export class SuGoServer extends Server {
  public logger: ILogger = console;
  public middleware: IHandler[] = [];
  public handleError: IErrorHandler;

  constructor(requestHandler: IHandler) {
    super({
      IncomingMessage: SuGoRequest,
      ServerResponse: SuGoResponse,
    } as any);
    assert(typeof requestHandler === 'function', `The "requestHandler" must be a function. Value: ${requestHandler}`);
    const self = this;
    this.handleError = this.defaultErrorHandler;
    this.addListener('close', this.closeEventHandler)
      .addListener('error', this.errorEventHandler)
      .addListener('listening', this.listeningEventHandler)
      .addListener('request', async (req: SuGoRequest, res: SuGoResponse) => {
        try {
          req.setLogger(self.logger).parseUrl();
          res.setLogger(self.logger);
          res.id = req.id;
          res.path = req.path;
          res.method = req.method;
          await req.getBody(); // Adds body property to request
          let idx = 0;

          const next: INextFunction = async (): Promise<void> => {
            if (idx >= this.middleware.length) {
              return await requestHandler(req, res);
            }
            const layer = this.middleware[idx++];
            await layer(req, res, next);
          };
          await next();
        } catch (err) {
          self.handleError(req, res, err);
        }
      });
  }

  public closeEventHandler() {
    if (this.logger) {
      this.logger.info('The connection has been closed!');
    }
  }

  public errorEventHandler(err: IError) {
    if (this.logger) {
      this.logger.error(`An error has ocurred --> ${err.name} ${err.message} ${err.stack}`);
    }
  }

  public listeningEventHandler() {
    if (this.logger) {
      this.logger.info(`Listening on port "${(this.address() as AddressInfo).port}"`);
    }
  }

  public useMiddleware(fn: IHandler) {
    this.middleware.push(fn);
    return this;
  }

  public defaultErrorHandler(req: SuGoRequest, res: SuGoResponse, err: IError) {
    /* If the error object has a handle method we use it */
    if (typeof err.handle === 'function') {
      err.handle(req, res);
    } else {
      const json = {
        code: err.code || 'N/A',
        message: err.message || 'Unexpected Error',
        name: err.name || err.constructor.name,
        stack: '',
        status: err.status || 500,
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

  public setErrorHandler(fn: IErrorHandler) {
    this.handleError = fn;
    return this;
  }
}

export default SuGoServer;
