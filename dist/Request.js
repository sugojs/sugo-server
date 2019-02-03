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
const IncomingMessage = http.IncomingMessage;
const url = require("url");
const util = require("util");
class SuGoRequest extends IncomingMessage {
    constructor() {
        super(...arguments);
        this.id = Math.random()
            .toString(36)
            .substr(2);
        this.body = {};
        this.rawBody = Buffer.from('', 'utf8');
        this.path = '';
        this.query = {};
        this.logger = console;
        this.url = '';
        this.pathname = '';
        this.method = '';
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
        this.path = pathname ? pathname : '';
        this.query = query;
        return this;
    }
    log() {
        let log = util.format('Request ID: ( %s ) %s: %s', this.id, this.method, this.url);
        if (Object.keys(this.query).length > 0) {
            log += util.format(' --> query %j', this.query);
        }
        if (Object.keys(this.body).length > 0) {
            log += util.format(' --> body %j', this.body);
        }
        this.logger.info(log);
        return this;
    }
    getBody() {
        return __awaiter(this, void 0, void 0, function* () {
            const req = this;
            return new Promise(resolve => {
                this.on('data', data => {
                    const auxBuffer = Buffer.from(data, 'utf8');
                    req.rawBody = Buffer.concat([req.rawBody, auxBuffer]);
                }).on('end', () => {
                    req.body = req.rawBody.length > 0 ? JSON.parse(req.rawBody.toString()) : {};
                    if (this.logger) {
                        req.log();
                    }
                    resolve(req.body);
                });
            });
        });
    }
}
exports.default = SuGoRequest;
