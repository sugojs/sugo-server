import * as assert from 'assert';
import { Server, ServerOptions } from 'https';
import { parse } from 'url';
import { IMiddlewareBehavior, MiddlewareBehavior } from './Behaviors/Middleware';
import { IHandler } from './Interfaces';
import SuGoRequest from './Request';
import SuGoResponse from './Response';

export * from './Interfaces';

export class SuGoSecureServer extends Server {
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
      const { path, query } = parse(req.url as string, true);
      req.path = path;
      req.query = query;
      res.id = req.id;
      res.url = req.url || '';
      res.method = req.method || '';
      return await this.runStack(req, res, requestHandler);
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
}

export default SuGoSecureServer;
