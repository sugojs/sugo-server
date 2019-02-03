import * as http from 'http';
declare const IncomingMessage: typeof http.IncomingMessage;
import { ILogger } from './Interfaces';
export default class SuGoRequest extends IncomingMessage {
    id: string;
    body: {};
    rawBody: Buffer;
    path: string;
    query: {};
    logger: ILogger;
    url: string;
    pathname: string;
    method: string;
    [key: string]: any;
    setId(): SuGoRequest;
    setLogger(logger: ILogger): SuGoRequest;
    parseUrl(): SuGoRequest;
    log(): this;
    getBody(): Promise<{}>;
}
export {};
