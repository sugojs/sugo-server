const http = require("http");
const ServerResponse = http.ServerResponse;

class SuGoResponse extends ServerResponse {
  constructor(req, logger = console) {
    super(req);
    this.body = {};
    this.logger = logger;
    this.id = req.id;
    this.path = req.path;
    this.method = req.method;
    this.on("close", this.closeEventHandler);
    this.on("error", this.errorEventHandler);
    this.on("finish", this.finishEventHandler);
  }

  closeEventHandler() {
    this.logger.error("ERROR EVENT");
  }

  errorEventHandler(err) {
    this.logger.error("Response ERROR EVENT --> err", err);
  }

  finishEventHandler() {
    this.logResponse();
  }

  logResponse() {
    const now = new Date().toISOString();
    const { id, statusCode, statusMessage, body, method, path } = this;
    const log = `${now}: Response ${id} ${method} ${path} ${statusCode} ${statusMessage} ---> body: ${JSON.stringify(
      body
    )}`;
    if (statusCode >= 400) {
      this.logger.error(log);
    } else {
      this.logger.info(log);
    }
    return this;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  json(data) {
    this.end(JSON.stringify(data));
    return this;
  }

  write(data) {
    this.body = data;
    return super.write(data);
  }

  end(data) {
    this.body = data;
    return super.end(data);
  }
}

module.exports = SuGoResponse;
