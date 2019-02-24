import SuGoRequest from "./Request";
import SuGoResponse from "./Response";
import { INextFunction } from "./Behaviors";

export interface IDynamicObject {
  [key: string]: any;
}
export type IHandler = (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => any;
