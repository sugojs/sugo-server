import { IHandler } from '../Http';
import SuGoRequest from '../Request';
import SuGoResponse from '../Response';

export type INextFunction = () => any;

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

    const next: INextFunction = async (): Promise<void> => {
      if (idx >= this.middleware.length) {
        return await requestHandler(req, res);
      }
      const layer = this.middleware[idx++];
      await layer(req, res, next);
    };
    await next();
  }
}
