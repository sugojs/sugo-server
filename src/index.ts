import { ServerOptions } from 'https';
import SuGoServer from './Http';
import SuGoSecureServer from './Https';
import { IHandler } from './Interfaces';

export * from './Request';
export * from './Response';
export * from './Http';
export * from './Https';
export * from './Interfaces';
export * from './Behaviors';
export const createServer = (requestListener: IHandler) => new SuGoServer(requestListener);
export const createSecureServer = (requestListener: IHandler, options: ServerOptions) =>
  new SuGoSecureServer(requestListener, options);
