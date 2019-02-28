import * as http from 'http';
const IncomingMessage = http.IncomingMessage;
import { IDynamicObject } from './Interfaces';

export class SuGoRequest extends IncomingMessage {
  public id?: string = Math.random()
    .toString(36)
    .substr(2);
  public body?: any = {};
  public query?: IDynamicObject = {};
  public params?: IDynamicObject = {};
  [key: string]: any;
}

export default SuGoRequest;
