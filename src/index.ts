import { ServerOptions } from 'https';
import SuGoServer from './Http';
import SuGoSecureServer from './Https';
import { IRequestHandler } from './Interfaces';

export * from './Request';
export * from './Response';
export * from './Http';
export * from './Https';
export * from './Interfaces';
export * from './Behaviors';
export const createServer = (requestListener: IRequestHandler) => new SuGoServer(requestListener);
export const createSecureServer = (requestListener: IRequestHandler, options: ServerOptions) =>
  new SuGoSecureServer(requestListener, options);
