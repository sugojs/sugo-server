import { INextFunction } from './behaviors';
import SuGoRequest from './request';
import SuGoResponse from './response';

export interface IDynamicObject {
  [key: string]: any;
}
export type IMiddlewareHandler = (req: SuGoRequest, res: SuGoResponse, next: INextFunction) => any;
export type IRequestHandler = (req: SuGoRequest, res: SuGoResponse) => any;
