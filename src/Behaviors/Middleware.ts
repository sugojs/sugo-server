import { IHandler } from '../Interfaces';
import SuGoRequest from '../Request';
import SuGoResponse from '../Response';

export type INextFunction = (error?: any) => any;

export interface IMiddlewareBehavior {
  middleware: IHandler[];
  useMiddleware: (fn: IHandler) => any;
  runStack: (req: SuGoRequest, res: SuGoResponse, requestHandler: IHandler) => any;
}

export class MiddlewareBehavior implements IMiddlewareBehavior {
  public middleware: IHandler[] = [];

  public useMiddleware(fn: IHandler) {
    this.middleware.push(fn);
    return this;
  }

  public async runStack(req: SuGoRequest, res: SuGoResponse, requestHandler: IHandler) {
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
}
