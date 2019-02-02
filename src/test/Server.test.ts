import * as chai from "chai";
import { createServer } from "../index";
import SuGoServer from "../Server";
const PATH = "/foo";
const headers = { "Content-Type": "application/json" };
import * as chaiHttp from "chai-http";
import SuGoRequest from "../Request";
import SuGoResponse from "../Response";
import CustomError from "./CustomError";
import CustomHandledError from "./CustomHandledError";

const HANDLER = (req: SuGoRequest, res: SuGoResponse) => {
  res.writeHead(200, headers);
  res.end(
    JSON.stringify({
      req: {
        body: req.body,
        id: req.id,
        method: req.method,
        path: req.path,
        query: req.query
      },
      res: { id: res.id, path: res.path, method: res.method }
    })
  );
};
chai.use(chaiHttp);
chai.should();

// Our parent block
describe("SuGo Server", () => {
  const server = createServer(HANDLER).setLogger(null);
  describe(`Request`, () => {
    it("The request id should be set", async () => {
      const response = await chai
        .request(server)
        .post(PATH)
        .send({ foo: "fighters" });
      response.body.req.should.have.property("id");
    });

    it("The request path should be set", async () => {
      const response = await chai.request(server).get(PATH);
      response.body.req.should.have.property("path");
    });

    it("The request body should be set if post data is sent", async () => {
      const response = await chai
        .request(server)
        .post(PATH)
        .send({ foo: "fighters" });
      response.body.req.should.have.property("body");
      response.body.req.body.should.have.property("foo");
      response.body.req.body.foo.should.be.eql("fighters");
    });

    it("The request query should be set if queryparams are sent", async () => {
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
    it("The response id should be equal to the request id", async () => {
      const response = await chai
        .request(server)
        .post(PATH)
        .send({ foo: "fighters" });
      response.body.res.should.have.property("id");
      response.body.res.id.should.be.eql(response.body.req.id);
    });

    it("The response path should be equal to the request path", async () => {
      const response = await chai.request(server).get(PATH);
      response.body.res.should.have.property("path");
      response.body.res.path.should.be.eql(response.body.req.path);
    });

    it("The response method should be equal to the request method", async () => {
      const response = await chai.request(server).get(PATH);
      response.body.res.should.have.property("method");
      response.body.res.method.should.be.eql(response.body.req.method);
    });

    it("should have the status code sent to the status() method", async () => {
      const status = 201;
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        res.status(status);
        res.end({});
      }).setLogger(null);
      const response = await chai.request(newServer).get(PATH);
      response.should.have.status(status);
    });

    it("should have the body sent to the json() method", async () => {
      const status = 201;
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        res.status(status);
        res.json({ foo: "fighters" });
      }).setLogger(null);
      const response = await chai.request(newServer).get(PATH);
      response.should.have.status(status);
      response.body.should.have.property("foo");
      response.body.foo.should.be.eql("fighters");
    });
  });

  describe(`Middleware`, () => {
    it("should run the added middleware", async () => {
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) =>
        res.json({ first: req.first, second: req.second })
      ).setLogger(null);
      server.useMiddleware(
        (req: SuGoRequest, res: SuGoResponse) => (req.first = true)
      );
      server.useMiddleware(
        (req: SuGoRequest, res: SuGoResponse) => (req.second = true)
      );
      const response = await chai.request(newServer).get(PATH);
      response.body.should.have.property("first");
      response.body.first.should.be.eql(true);
      response.body.should.have.property("second");
      response.body.second.should.be.eql(true);
    });
  });

  describe(`Error handler`, () => {
    it("should handle the unexpected error", async () => {
      const errorMessage = "New error";
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        throw new Error(errorMessage);
      }).setLogger(null);
      const response = await chai.request(newServer).get(PATH);
      response.status.should.be.eql(500);
      response.body.name.should.be.eql("Error");
      response.body.message.should.be.eql(errorMessage);
    });

    it("should handle the custom error the default way", async () => {
      const errorMessage = "New error";
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        throw new CustomError("New error");
      }).setLogger(null);
      const response = await chai.request(newServer).get(PATH);
      response.status.should.be.eql(400);
      response.body.name.should.be.eql("CustomError");
      response.body.message.should.be.eql(errorMessage);
      response.body.should.not.have.property("extraData");
    });

    it("should handle the custom error with it's handle method", async () => {
      const errorMessage = "New error";
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        throw new CustomHandledError("New error");
      }).setLogger(null);
      const response = await chai.request(newServer).get(PATH);
      response.status.should.be.eql(400);
      response.body.name.should.be.eql("CustomHandledError");
      response.body.message.should.be.eql(errorMessage);
      response.body.should.have.property("extraData");
      response.body.extraData.should.be.eql(true);
    });
  });

  after(() => {
    process.exit(0);
  });
});
