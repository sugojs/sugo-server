import SuGoRequest from '../Request';
import SuGoResponse from '../Response';

export interface IError {
  status: number;
  message: string;
  name: string;
  code: string;
  stack: string;
  handle: (req: SuGoRequest, res: SuGoResponse) => void;
}

export type IErrorHandler = (req: SuGoRequest, res: SuGoResponse, err: IError) => any;

export interface IErrorHandlingBehavior {
  handleError: IErrorHandler;
  setErrorHandler: (fn: IErrorHandler) => any;
}

export class ErrorHandlingBehavior implements IErrorHandlingBehavior {
  public handleError: IErrorHandler = (req: SuGoRequest, res: SuGoResponse, err: IError) => {
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
  };
  public setErrorHandler(fn: IErrorHandler) {
    this.handleError = fn;
    return this;
  }
}
