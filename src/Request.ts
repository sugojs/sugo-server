import * as http from 'http';
const IncomingMessage = http.IncomingMessage;
import { posix } from 'path';
import * as url from 'url';
import * as util from 'util';
import { ILogger, ILogginBehavior, LogginBehavior } from './Behaviors/Logging';
import { IDynamicObject } from './Interfaces';

export class SuGoRequest extends IncomingMessage {
  public id = Math.random()
    .toString(36)
    .substr(2);
  public body: IDynamicObject | string = {};
  public rawBody = Buffer.from('', 'utf8');
  public path = '';
  public query: IDynamicObject = {};
  public params: IDynamicObject = {};
  public loggingBehavior: ILogginBehavior = new LogginBehavior();
  public url = '';
  public pathname = '';
  public method = '';
  [key: string]: any;

  public setId(): SuGoRequest {
    const id = Math.random()
      .toString(36)
      .substr(2);
    this.id = id;
    return this;
  }

  public get logger() {
    return this.loggingBehavior.logger;
  }

  public setLogger(logger: ILogger) {
    this.loggingBehavior.setLogger(logger);
    return this;
  }

  public parseUrl(): SuGoRequest {
    const normalizedUrl = posix.normalize(this.url);
    const { pathname, query } = url.parse(normalizedUrl, true);
    this.path = pathname ? pathname : '';
    this.query = query;
    return this;
  }

  public log() {
    let log: string = util.format('Request ID: ( %s ) %s: %s', this.id, this.method, this.url);
    if (Object.keys(this.query).length > 0) {
      log += util.format(' --> query %j', this.query);
    }
    if (Object.keys(this.body).length > 0) {
      log += util.format(' --> body %j', this.body);
    }
    this.logger.info(log);
    return this;
  }

  public async getBody() {
    const req = this;
    return new Promise(resolve => {
      this.on('data', data => {
        const auxBuffer = Buffer.from(data, 'utf8');
        req.rawBody = Buffer.concat([req.rawBody, auxBuffer]);
      }).on('end', () => {
        try {
          req.body = req.rawBody.length > 0 ? JSON.parse(req.rawBody.toString()) : {};
        } catch (error) {
          req.body = req.rawBody;
        }
        req.log();
        resolve(req.body);
      });
    });
  }
}

export default SuGoRequest;
