"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CustomError_1 = require("./CustomError");
class CustomHandledError extends CustomError_1.default {
    constructor() {
        super(...arguments);
        this.name = "CustomHandledError";
        this.code = "CustomHandledError";
    }
    handle(req, res) {
        const json = {
            code: this.code,
            extraData: this.extraData,
            message: this.message,
            name: this.constructor.name,
            status: this.status
        };
        res.status(json.status).json(json);
    }
}
exports.default = CustomHandledError;
