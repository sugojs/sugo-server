import SuGoRequest from '../Request';
import SuGoResponse from '../Response';
import CustomError from './CustomError';
export default class CustomHandledError extends CustomError {
    name: string;
    code: string;
    handle(req: SuGoRequest, res: SuGoResponse): void;
}
