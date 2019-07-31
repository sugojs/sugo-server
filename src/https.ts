import * as assert from 'assert';
import { Server, ServerOptions } from 'https';
import { parse } from 'url';

import { IMiddlewareBehavior, MiddlewareBehavior } from './behaviors/middleware';
import { IRequestHandler } from './interfaces';
import SuGoRequest from './request';
import SuGoResponse from './response';

export * from './interfaces';

export class SuGoSecureServer extends Server {
  public get middleware() {
    return this.middlewareBehavior.middleware;
  }
  public middlewareBehavior: IMiddlewareBehavior = new MiddlewareBehavior();

  constructor(requestHandler: IRequestHandler, options: ServerOptions) {
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

  public async runStack(req: SuGoRequest, res: SuGoResponse, requestHandler: IRequestHandler) {
    await this.middlewareBehavior.runStack(req, res, requestHandler);
    return this;
  }

  public useMiddleware(fn: IRequestHandler) {
    this.middlewareBehavior.useMiddleware(fn);
    return this;
  }
}

export default SuGoSecureServer;
