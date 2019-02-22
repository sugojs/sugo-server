import { ServerOptions } from 'https';
import { IHandler } from './Http';
import SuGoServer from './Http';
import SuGoSecureServer from './Https';

export * from './Request';
export * from './Response';
export * from './Http';
export * from './Interfaces';
export const createServer = (requestListener: IHandler) => new SuGoServer(requestListener);
export const createSecureServer = (requestListener: IHandler, options: ServerOptions) =>
  new SuGoSecureServer(requestListener, options);
