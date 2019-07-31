import { ServerOptions } from 'https';

import SuGoServer from './http';
import SuGoSecureServer from './https';
import { IRequestHandler } from './interfaces';

export * from './request';
export * from './response';
export * from './http';
export * from './https';
export * from './interfaces';
export * from './behaviors';
export const createServer = (requestListener: IRequestHandler) => new SuGoServer(requestListener);
export const createSecureServer = (requestListener: IRequestHandler, options: ServerOptions) =>
  new SuGoSecureServer(requestListener, options);
