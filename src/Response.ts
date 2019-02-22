import * as http from 'http';
import { IError } from './Behaviors/ErrorHandling';
import { ILogger, ILogginBehavior, LogginBehavior } from './Behaviors/Logging';
import { IDynamicObject } from './Interfaces';
import SuGoRequest from './Request';
const ServerResponse = http.ServerResponse;

export class SuGoResponse extends ServerResponse {
  public body: IDynamicObject = {};
  public loggingBehavior: ILogginBehavior = new LogginBehavior();
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

  public get logger() {
    return this.loggingBehavior.logger;
  }

  public setLogger(logger: ILogger) {
    this.loggingBehavior.setLogger(logger);
    return this;
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

export default SuGoResponse;
