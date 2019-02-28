import * as http from 'http';
const Server = http.Server;
import * as assert from 'assert';
import { parse } from 'url';
import { ErrorHandlingBehavior, IError, IErrorHandler, IErrorHandlingBehavior } from './Behaviors/ErrorHandling';
import { IMiddlewareBehavior, MiddlewareBehavior } from './Behaviors/Middleware';
import { IHandler } from './Interfaces';
import SuGoRequest from './Request';
import SuGoResponse from './Response';

export class SuGoServer extends Server {
  public errorHandlingBehavior: IErrorHandlingBehavior = new ErrorHandlingBehavior();
  public middlewareBehavior: IMiddlewareBehavior = new MiddlewareBehavior();

  constructor(requestHandler: IHandler) {
    super({
      IncomingMessage: SuGoRequest,
      ServerResponse: SuGoResponse,
    } as any);
    assert(typeof requestHandler === 'function', `The "requestHandler" must be a function. Value: ${requestHandler}`);
    const self = this;
    this.addListener('request', async (req: SuGoRequest, res: SuGoResponse) => {
      try {
        const { path, query } = parse(req.url as string, true);
        req.path = path;
        req.query = query;
        res.id = req.id;
        res.url = req.url;
        res.method = req.method;
        return await this.runStack(req, res, requestHandler);
      } catch (err) {
        self.handleError(req, res, err);
      }
    });
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

export default SuGoServer;
