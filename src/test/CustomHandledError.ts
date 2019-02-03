import SuGoRequest from '../Request';
import SuGoResponse from '../Response';
import CustomError from './CustomError';

export default class CustomHandledError extends CustomError {
  public name = 'CustomHandledError';
  public code = 'CustomHandledError';

  public handle(req: SuGoRequest, res: SuGoResponse): void {
    const json = {
      code: this.code,
      extraData: this.extraData,
      message: this.message,
      name: this.constructor.name,
      status: this.status,
    };
    res.status(json.status).json(json);
  }
}
