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
const http = require("http");
const Server = http.Server;
const assert = require("assert");
const Request_1 = require("./Request");
const Response_1 = require("./Response");
class SuGoServer extends Server {
    constructor(requestHandler) {
        super({
            IncomingMessage: Request_1.default,
            ServerResponse: Response_1.default
        });
        this.logger = console;
        this.middleware = [];
        assert(typeof requestHandler === "function", `The "requestHandler" must be a function. Value: ${requestHandler}`);
        const self = this;
        this.handleError = this.defaultErrorHandler;
        this.addListener("close", this.closeEventHandler)
            .addListener("error", this.errorEventHandler)
            .addListener("listening", this.listeningEventHandler)
            .addListener("request", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                req.setLogger(self.logger).parseUrl();
                res.setLogger(self.logger);
                res.id = req.id;
                res.path = req.path;
                res.method = req.method;
                yield req.getBody(); // Adds body property to request
                for (const fn of self.middleware) {
                    yield fn(req, res);
                }
                yield requestHandler(req, res); // User custom request Handler
            }
            catch (err) {
                self.handleError(req, res, err);
            }
        }));
    }
    closeEventHandler() {
        if (this.logger) {
            this.logger.log("The connection has been closed!");
        }
    }
    errorEventHandler(err) {
        if (this.logger) {
            this.logger.error(`An error has ocurred --> ${err.name} ${err.message} ${err.stack}`);
        }
    }
    listeningEventHandler() {
        if (this.logger) {
            this.logger.log(`Listening on port "${this.address()}"`);
        }
    }
    useMiddleware(fn) {
        this.middleware.push(fn);
        return this;
    }
    defaultErrorHandler(req, res, err) {
        /* If the error object has a handle method we use it */
        if (typeof err.handle === "function") {
            err.handle(req, res);
        }
        else {
            const json = {
                code: err.code || "N/A",
                message: err.message || "Unexpected Error",
                name: err.name || err.constructor.name,
                stack: "",
                status: err.status || 500
            };
            if (err.stack) {
                json.stack = err.stack;
            }
            res.status(json.status).json(json);
        }
    }
    setLogger(logger) {
        this.logger = logger;
        return this;
    }
    setErrorHandler(fn) {
        this.handleError = fn;
        return this;
    }
}
exports.default = SuGoServer;
