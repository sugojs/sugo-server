import { ILogger } from '../Interfaces';

export default class DummyLogger implements ILogger {
  public log(message: string) {
    return;
  }

  public debug(message: string) {
    return;
  }

  public warn(message: string) {
    return;
  }

  public info(message: string) {
    return;
  }

  public error(message: string) {
    return;
  }
}
