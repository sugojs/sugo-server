const chai = require("chai");
const SuGoServer = require("../Server");
const PATH = "/foo";
const headers = { "Content-Type": "application/json" };
const chaiHttp = require("chai-http");
const HANDLER = (req, res) => {
  res.writeHead(200, headers);
  res.end(
    JSON.stringify({
      req: { id: req.id, body: req.body, query: req.query, path: req.path, method: req.method },
      res: { id: res.id, path: res.path, method: res.method }
    })
  );
};
chai.use(chaiHttp);
chai.should();

//Our parent block
describe("SuGo Server", () => {
  let server = new SuGoServer(HANDLER, null);
  describe(`Request`, () => {
    it("The request id should be set", async function() {
      const response = await chai
        .request(server)
        .post(PATH)
        .send({ foo: "fighters" });
      response.body.req.should.have.property("id");
    });

    it("The request path should be set", async function() {
      const response = await chai.request(server).get(PATH);
      response.body.req.should.have.property("path");
    });

    it("The request body should be set if post data is sent", async function() {
      const response = await chai
        .request(server)
        .post(PATH)
        .send({ foo: "fighters" });
      response.body.req.should.have.property("body");
      response.body.req.body.should.have.property("foo");
      response.body.req.body.foo.should.be.eql("fighters");
    });

    it("The request query should be set if queryparams are sent", async function() {
      const response = await chai
        .request(server)
        .get(PATH)
        .query({ foo: "fighters" });
      response.body.req.should.have.property("query");
      response.body.req.query.should.have.property("foo");
      response.body.req.query.foo.should.be.eql("fighters");
    });
  });

  describe(`SuGoResponse`, () => {
    it("The response id should be equal to the request id", async function() {
      const response = await chai
        .request(server)
        .post(PATH)
        .send({ foo: "fighters" });
      response.body.res.should.have.property("id");
      response.body.res.id.should.be.eql(response.body.req.id);
    });

    it("The response path should be equal to the request path", async function() {
      const response = await chai.request(server).get(PATH);
      response.body.res.should.have.property("path");
      response.body.res.path.should.be.eql(response.body.req.path);
    });

    it("The response method should be equal to the request method", async function() {
      const response = await chai.request(server).get(PATH);
      response.body.res.should.have.property("method");
      response.body.res.method.should.be.eql(response.body.req.method);
    });

    it("should have the status code sent to the status() method", async function() {
      const status = 201;
      const server = new SuGoServer((req, res) => {
        res.status(status);
        res.end();
      }, null);
      const response = await chai.request(server).get(PATH);
      response.should.have.status(status);
    });

    it("should have the body sent to the json() method", async function() {
      const status = 201;
      const server = new SuGoServer((req, res) => {
        res.status(status);
        res.json({ foo: "fighters" });
      }, null);
      const response = await chai.request(server).get(PATH);
      response.should.have.status(status);
      response.body.should.have.property("foo");
      response.body.foo.should.be.eql("fighters");
    });
  });

  describe(`Middleware`, () => {
    it("should run the added middleware", async function() {
      const server = new SuGoServer((req, res) => res.json({ first: req.first, second: req.second }), null);
      server.useMiddleware((req, res) => (req.first = true));
      server.useMiddleware((req, res) => (req.second = true));
      const response = await chai.request(server).get(PATH);
      response.body.should.have.property("first");
      response.body.should.be.eql(true);
      response.body.should.have.property("second");
      response.body.second.should.be.eql(true);
    });
  });

  after(() => {
    process.exit(0);
  });
});
