import { IHandler } from './Server';
import SuGoServer from './Server';

export * from './Request';
export * from './Response';
export * from './Server';
export * from './Interfaces';
export const createServer = (requestListener: IHandler) => new SuGoServer(requestListener);
