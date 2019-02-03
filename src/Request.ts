import * as http from 'http';
const IncomingMessage = http.IncomingMessage;
import * as url from 'url';
import * as util from 'util';
import { IDynamicObject, ILogger } from './Interfaces';

export default class SuGoRequest extends IncomingMessage {
  public id = Math.random()
    .toString(36)
    .substr(2);
  public body: IDynamicObject = {};
  public rawBody = Buffer.from('', 'utf8');
  public path = '';
  public query: IDynamicObject = {};
  public params: IDynamicObject = {};
  public logger: ILogger = console;
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

  public setLogger(logger: ILogger): SuGoRequest {
    this.logger = logger;
    return this;
  }

  public parseUrl(): SuGoRequest {
    const { pathname, query } = url.parse(this.url, true);
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
        req.body = req.rawBody.length > 0 ? JSON.parse(req.rawBody.toString()) : {};
        if (this.logger) {
          req.log();
        }
        resolve(req.body);
      });
    });
  }
}
