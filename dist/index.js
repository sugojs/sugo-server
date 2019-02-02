"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("./Server");
__export(require("./Request"));
__export(require("./Response"));
__export(require("./Server"));
exports.createServer = (requestListener) => new Server_1.default(requestListener);
