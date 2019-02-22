export interface ILogger {
  log(...messages: string[]): void;
  info(...messages: string[]): void;
  debug(...messages: string[]): void;
  warn(...messages: string[]): void;
  error(...messages: string[]): void;
}

export interface ILogginBehavior {
  logger: ILogger;
  setLogger(logger: ILogger): any;
}

export class LogginBehavior implements ILogginBehavior {
  public logger: ILogger = console;

  public setLogger(logger: ILogger) {
    this.logger = logger;
    return this;
  }
}
