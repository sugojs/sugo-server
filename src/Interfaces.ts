import { INextFunction } from './Behaviors';
import SuGoRequest from './Request';
import SuGoResponse from './Response';

export interface IDynamicObject {
  [key: string]: any;
}
export type IHandler = (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => any;
