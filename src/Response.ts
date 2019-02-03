import * as http from 'http';
import { IDynamicObject, IError, ILogger } from './Interfaces';
import SuGoRequest from './Request';
const ServerResponse = http.ServerResponse;

export default class SuGoResponse extends ServerResponse {
  public body: IDynamicObject = {};
  public logger: ILogger = console;
  public id = '';
  public method = '';
  public path = '';
  [key: string]: any;

  constructor(req: SuGoRequest) {
    super(req);
    this.on('close', this.closeEventHandler);
    this.on('error', this.errorEventHandler);
    this.on('finish', this.finishEventHandler);
  }

  public setLogger(logger: ILogger) {
    this.logger = logger;
  }

  public closeEventHandler() {
    if (this.logger) {
      this.logger.error('CLOSE EVENT');
    }
  }

  public errorEventHandler(err: IError) {
    if (this.logger) {
      this.logger.error('Response ERROR EVENT --> err', JSON.stringify(err));
    }
  }

  public finishEventHandler() {
    if (this.logger) {
      this.log();
    }
  }

  public log() {
    const now = new Date().toISOString();
    const { id, statusCode, statusMessage, body, method, path } = this;
    const log = `${now}: Response ${id} ${method} ${path} ${statusCode} ${statusMessage} ---> body: ${JSON.stringify(
      body,
    )}`;
    if (statusCode >= 400) {
      this.logger.error(log);
    } else {
      this.logger.info(log);
    }
    return this;
  }

  public status(code: number) {
    this.statusCode = code;
    return this;
  }

  public json(data: any) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
    return this;
  }

  public write(data: any) {
    this.body = data;
    return super.write(data);
  }

  public end(data?: any) {
    this.body = data;
    return super.end(data);
  }
}
