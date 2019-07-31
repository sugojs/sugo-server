import * as assert from 'assert';
import * as http from 'http';
import { parse } from 'url';

import { IMiddlewareBehavior, MiddlewareBehavior } from './behaviors/middleware';
import { IMiddlewareHandler, IRequestHandler } from './interfaces';
import SuGoRequest from './request';
import SuGoResponse from './response';
const Server = http.Server;

export class SuGoServer extends Server {
  public get middleware() {
    return this.middlewareBehavior.middleware;
  }
  public middlewareBehavior: IMiddlewareBehavior = new MiddlewareBehavior();

  constructor(requestHandler: IRequestHandler) {
    super({
      IncomingMessage: SuGoRequest,
      ServerResponse: SuGoResponse,
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

  public useMiddleware(fn: IMiddlewareHandler) {
    this.middlewareBehavior.useMiddleware(fn);
    return this;
  }
}

export default SuGoServer;
