const http = require("http");
const IncomingMessage = http.IncomingMessage;
const qs = require("querystring");

class SuGoRequest extends IncomingMessage {
  constructor(socket, logger = console) {
    super(socket);
    this.logger = logger;
    this.body = [];
    this.setId()
      .proccessUrl()
      .on("error", this.errorEventHandler)
      .on("data", this.dataEventHandler)
      .on("end", this.endEventHandler);
  }

  setId() {
    const id = Math.random()
      .toString(36)
      .substr(2);
    this.id = id;
    return this;
  }

  proccessUrl() {
    /* Querystring  */
    const [path, querystring] = this.url.split("?");
    this.path = path;
    this.query = qs.parse(querystring) || {};
    return this;
  }

  logRequest() {
    /** We log our thisuest */
    const now = new Date().toISOString(),
      { id, method, path, query } = this;

    if (["GET", "OPTIONS", "HEAD"].includes(this.method)) {
      this.logger.info(
        `${now}: Request ${id} ${method} ${path} --> query: ${JSON.stringify(
          query
        )}`
      );
    } else {
      const { id, method, path, body } = this;
      this.logger.info(
        `${now}: Request ${id} ${method} ${path} --> body: ${JSON.stringify(
          body
        )}`
      );
    }
  }

  errorEventHandler(err) {
    this.logger.error("Request Error Event --> err: ", err);
  }

  dataEventHandler(chunk) {
    this.body = [];
    this.body.push(chunk);
  }

  endEventHandler() {
    /** We parse our thisuest body as a JSON object */
    if (this.body.length > 0) {
      this.body = JSON.parse(Buffer.concat(this.body).toString());
    } else {
      this.body = {};
    }
    this.logRequest();
  }
}

module.exports = SuGoRequest;
