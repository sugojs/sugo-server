import * as http from 'http';
const IncomingMessage = http.IncomingMessage;
import { IDynamicObject } from './interfaces';

export class SuGoRequest extends IncomingMessage {
  [key: string]: any;
  public body: any = {};
  public id: string = Math.random()
    .toString(36)
    .substr(2);
  public params: IDynamicObject = {};
  public query: IDynamicObject = {};
}

export default SuGoRequest;
