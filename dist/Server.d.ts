import * as http from "http";
declare const Server: typeof http.Server;
import { IError, ILogger } from "./Interfaces";
import SuGoRequest from "./Request";
import SuGoResponse from "./Response";
export declare type IHandler = (req: SuGoRequest, res: SuGoResponse) => void;
export declare type IErrorHandler = (req: SuGoRequest, res: SuGoResponse, err: IError) => void;
export default class SuGoServer extends Server {
    logger: ILogger;
    middleware: IHandler[];
    handleError: IErrorHandler;
    constructor(requestHandler: IHandler, logger?: ILogger);
    closeEventHandler(): void;
    errorEventHandler(err: IError): void;
    listeningEventHandler(): void;
    useMiddleware(fn: IHandler): this;
    defaultErrorHandler(req: SuGoRequest, res: SuGoResponse, err: IError): void;
    setLogger(logger: ILogger): this;
    setErrorHandler(fn: IHandler): this;
}
export {};
