"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const superagent = require("superagent");
const index_1 = require("../index");
const CustomError_1 = require("./CustomError");
const CustomHandledError_1 = require("./CustomHandledError");
const DummyLogger_1 = require("./DummyLogger");
const dummyLogger = new DummyLogger_1.default();
const PATH = "http://localhost:3000/foo";
const headers = { "Content-Type": "application/json" };
const HANDLER = (req, res) => {
    res.writeHead(200, headers);
    res.end(JSON.stringify({
        req: {
            body: req.body,
            id: req.id,
            method: req.method,
            path: req.path,
            query: req.query
        },
        res: { id: res.id, path: res.path, method: res.method }
    }));
};
chai.should();
// Our parent block
describe("SuGo Server", () => {
    const server = index_1.createServer(HANDLER).setLogger(dummyLogger);
    before(() => {
        server.listen(3000);
    });
    after(() => {
        server.close();
    });
    describe(`Request`, () => {
        it("The request id should be set", () => __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield superagent.post(PATH).send({ foo: "fighters" });
                response.body.req.should.have.property("id");
            }
            catch (error) {
                console.error(error);
            }
        }));
        it("The request path should be set", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield superagent.get(PATH);
            response.body.req.should.have.property("path");
        }));
        it("The request body should be set if post data is sent", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield chai
                .request(server)
                .post(PATH)
                .send({ foo: "fighters" });
            response.body.req.should.have.property("body");
            response.body.req.body.should.have.property("foo");
            response.body.req.body.foo.should.be.eql("fighters");
        }));
        it("The request query should be set if queryparams are sent", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield chai
                .request(server)
                .get(PATH)
                .query({ foo: "fighters" });
            response.body.req.should.have.property("query");
            response.body.req.query.should.have.property("foo");
            response.body.req.query.foo.should.be.eql("fighters");
        }));
    });
    describe(`SuGoResponse`, () => {
        it("The response id should be equal to the request id", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield chai
                .request(server)
                .post(PATH)
                .send({ foo: "fighters" });
            response.body.res.should.have.property("id");
            response.body.res.id.should.be.eql(response.body.req.id);
        }));
        it("The response path should be equal to the request path", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield superagent.get(PATH);
            response.body.res.should.have.property("path");
            response.body.res.path.should.be.eql(response.body.req.path);
        }));
        it("The response method should be equal to the request method", () => __awaiter(this, void 0, void 0, function* () {
            const response = yield superagent.get(PATH);
            response.body.res.should.have.property("method");
            response.body.res.method.should.be.eql(response.body.req.method);
        }));
        it("should have the status code sent to the status() method", () => __awaiter(this, void 0, void 0, function* () {
            const status = 201;
            const newServer = index_1.createServer((req, res) => {
                res.status(status);
                res.end({});
            }).setLogger(dummyLogger);
            const response = yield chai.request(newServer).get(PATH);
            response.should.have.status(status);
        }));
        it("should have the body sent to the json() method", () => __awaiter(this, void 0, void 0, function* () {
            const status = 201;
            const newServer = index_1.createServer((req, res) => {
                res.status(status);
                res.json({ foo: "fighters" });
            }).setLogger(dummyLogger);
            const response = yield chai.request(newServer).get(PATH);
            response.should.have.status(status);
            response.body.should.have.property("foo");
            response.body.foo.should.be.eql("fighters");
        }));
    });
    describe(`Middleware`, () => {
        it("should run the added middleware", () => __awaiter(this, void 0, void 0, function* () {
            const newServer = index_1.createServer((req, res) => res.json({ first: req.first, second: req.second })).setLogger(dummyLogger);
            server.useMiddleware((req, res) => (req.first = true));
            server.useMiddleware((req, res) => (req.second = true));
            const response = yield chai.request(newServer).get(PATH);
            response.body.should.have.property("first");
            response.body.first.should.be.eql(true);
            response.body.should.have.property("second");
            response.body.second.should.be.eql(true);
        }));
    });
    describe(`Error handler`, () => {
        it("should handle the unexpected error", () => __awaiter(this, void 0, void 0, function* () {
            const errorMessage = "New error";
            const newServer = index_1.createServer((req, res) => {
                throw new Error(errorMessage);
            }).setLogger(dummyLogger);
            const response = yield chai.request(newServer).get(PATH);
            response.status.should.be.eql(500);
            response.body.name.should.be.eql("Error");
            response.body.message.should.be.eql(errorMessage);
        }));
        it("should handle the custom error the default way", () => __awaiter(this, void 0, void 0, function* () {
            const errorMessage = "New error";
            const newServer = index_1.createServer((req, res) => {
                throw new CustomError_1.default("New error");
            }).setLogger(dummyLogger);
            const response = yield chai.request(newServer).get(PATH);
            response.status.should.be.eql(400);
            response.body.name.should.be.eql("CustomError");
            response.body.message.should.be.eql(errorMessage);
            response.body.should.not.have.property("extraData");
        }));
        it("should handle the custom error with it's handle method", () => __awaiter(this, void 0, void 0, function* () {
            const errorMessage = "New error";
            const newServer = index_1.createServer((req, res) => {
                throw new CustomHandledError_1.default("New error");
            }).setLogger(dummyLogger);
            const response = yield chai.request(newServer).get(PATH);
            response.status.should.be.eql(400);
            response.body.name.should.be.eql("CustomHandledError");
            response.body.message.should.be.eql(errorMessage);
            response.body.should.have.property("extraData");
            response.body.extraData.should.be.eql(true);
        }));
    });
    after(() => {
        process.exit(0);
    });
});
