import Server, { IHandler } from "./Server";
export * from "./Request";
export * from "./Response";
export * from "./Server";
export declare const createServer: (requestListener: IHandler) => Server;
