import SuGoRequest from './Request';
import SuGoResponse from './Response';

export interface ILogger {
  log(...messages: string[]): void;
  info(...messages: string[]): void;
  debug(...messages: string[]): void;
  warn(...messages: string[]): void;
  error(...messages: string[]): void;
}

export interface IError {
  status: number;
  message: string;
  name: string;
  code: string;
  stack: string;
  handle: (req: SuGoRequest, res: SuGoResponse) => void;
}
