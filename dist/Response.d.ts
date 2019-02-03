import * as http from 'http';
import { IError, ILogger } from './Interfaces';
import SuGoRequest from './Request';
declare const ServerResponse: typeof http.ServerResponse;
export default class SuGoResponse extends ServerResponse {
    body: {};
    logger: ILogger;
    id: string;
    method: string;
    path: string;
    constructor(req: SuGoRequest);
    setLogger(logger: ILogger): void;
    closeEventHandler(): void;
    errorEventHandler(err: IError): void;
    finishEventHandler(): void;
    log(): this;
    status(code: number): this;
    json(data: any): this;
    write(data: any): boolean;
    end(data: any): void;
}
export {};
