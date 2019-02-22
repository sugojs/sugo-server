import * as assert from 'assert';
import { Server, ServerOptions } from 'https';
import { ErrorHandlingBehavior, IError, IErrorHandler, IErrorHandlingBehavior } from './Behaviors/ErrorHandling';
import { ILogger, ILogginBehavior, LogginBehavior } from './Behaviors/Logging';
import { IMiddlewareBehavior, INextFunction, MiddlewareBehavior } from './Behaviors/Middleware';
import SuGoRequest from './Request';
import SuGoResponse from './Response';

export type IHandler = (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => any;

export * from './Interfaces';

export class SuGoSecureServer extends Server {
  public loggingBehavior: ILogginBehavior = new LogginBehavior();
  public errorHandlingBehavior: IErrorHandlingBehavior = new ErrorHandlingBehavior();
  public middlewareBehavior: IMiddlewareBehavior = new MiddlewareBehavior();

  constructor(requestHandler: IHandler, options: ServerOptions) {
    super({
      IncomingMessage: SuGoRequest,
      ServerResponse: SuGoResponse,
      cert: options.cert,
      key: options.key,
    } as any);
    assert(typeof requestHandler === 'function', `The "requestHandler" must be a function. Value: ${requestHandler}`);
    const self = this;
    this.addListener('request', async (req: SuGoRequest, res: SuGoResponse) => {
      try {
        req.setLogger(self.logger).parseUrl();
        res.setLogger(self.logger);
        res.id = req.id;
        res.path = req.path;
        res.method = req.method;
        await req.getBody(); // Adds body property to request
        return await this.runStack(req, res, requestHandler);
      } catch (err) {
        self.handleError(req, res, err);
      }
    });
  }

  public get logger() {
    return this.loggingBehavior.logger;
  }

  public setLogger(logger: ILogger) {
    this.loggingBehavior.setLogger(logger);
    return this;
  }

  public get middleware() {
    return this.middlewareBehavior.middleware;
  }

  public useMiddleware(fn: IHandler) {
    this.middlewareBehavior.useMiddleware(fn);
    return this;
  }

  public async runStack(req: SuGoRequest, res: SuGoResponse, requestHandler: IHandler) {
    await this.middlewareBehavior.runStack(req, res, requestHandler);
    return this;
  }

  public handleError(req: SuGoRequest, res: SuGoResponse, err: IError) {
    this.errorHandlingBehavior.handleError(req, res, err);
    return this;
  }

  public setErrorHandler(fn: IErrorHandler) {
    this.errorHandlingBehavior.setErrorHandler(fn);
    return this;
  }
}

export default SuGoSecureServer;
