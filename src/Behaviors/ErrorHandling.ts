import { IDynamicObject } from '../Interfaces';
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
  public handleError: IErrorHandler = (req: SuGoRequest, res: SuGoResponse, err: IDynamicObject) => {
    const defaultValues = {
      code: 'N/A',
      message: 'Unexpected Error',
      name: err.name ? err.name : err.constructor.name ? err.constructor.name : 'Error',
      status: 500,
    };
    const json = Object.getOwnPropertyNames(err).reduce((obj: IDynamicObject, key: string) => {
      obj[key] = err[key];
      return obj;
    }, defaultValues);
    res.status(json.status).json(json);
  };
  public setErrorHandler(fn: IErrorHandler) {
    this.handleError = fn;
    return this;
  }
}
