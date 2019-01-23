const http = require("http");
const IncomingMessage = http.IncomingMessage;
const url = require("url");
const util = require("util");

class SuGoRequest extends IncomingMessage {
  constructor(socket) {
    super(socket);
    this.setId();
    this.rawBody = new Buffer("", "utf8");
    this.body = {};
    this.path = "";
    this.query = {};
  }

  setId() {
    const id = Math.random()
      .toString(36)
      .substr(2);
    this.id = id;
    return this;
  }

  setLogger(logger) {
    this.logger = logger;
    return this;
  }

  parseUrl() {
    const { pathname, query } = url.parse(this.url, true);
    this.path = pathname;
    this.query = query;
    return this;
  }

  log() {
    var log = util.format("Request ID: ( %s ) %s: %s", this.id, this.method, this.url);
    if (Object.keys(this.query).length > 0) log += util.format(" --> query %j", this.query);
    if (Object.keys(this.body).length > 0) log += util.format(" --> body %j", this.body);
    this.logger.info(log);
    return this;
  }

  async getBody() {
    const req = this;
    return new Promise(resolve => {
      this.on("data", data => {
        let auxBuffer = new Buffer(data, "utf8");
        req.rawBody = Buffer.concat([req.rawBody, auxBuffer]);
      }).on("end", () => {
        req.body = req.rawBody.length > 0 ? JSON.parse(req.rawBody.toString()) : {};
        if (this.logger) req.log();
        resolve(req.body);
      });
    });
  }
}

module.exports = SuGoRequest;
