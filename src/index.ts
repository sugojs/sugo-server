import Server, { IHandler } from "./Server";

export * from "./Request";
export * from "./Response";
export * from "./Server";
export const createServer = (requestListener: IHandler) =>
  new Server(requestListener);
