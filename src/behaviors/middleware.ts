import { IMiddlewareHandler, IRequestHandler } from '../interfaces';
import SuGoRequest from '../request';
import SuGoResponse from '../response';

export type INextFunction = (error?: any) => any;

export interface IMiddlewareBehavior {
  middleware: IMiddlewareHandler[];
  runStack: (req: SuGoRequest, res: SuGoResponse, requestHandler: IRequestHandler) => any;
  useMiddleware: (fn: IMiddlewareHandler) => any;
}

export class MiddlewareBehavior implements IMiddlewareBehavior {
  public middleware: IMiddlewareHandler[] = [];

  public async runStack(req: SuGoRequest, res: SuGoResponse, requestHandler: IRequestHandler) {
    let idx = 0;

    const next: INextFunction = async (err?: any): Promise<void> => {
      // For ExpressJS Compability, we verify if an error was given, if it was, we throw that error
      if (err) {
        throw err;
      }
      if (idx >= this.middleware.length) {
        return await requestHandler(req, res);
      }
      const layer = this.middleware[idx++];
      await layer(req, res, next);
    };
    await next();
  }

  public useMiddleware(fn: IMiddlewareHandler) {
    this.middleware.push(fn);
    return this;
  }
}
