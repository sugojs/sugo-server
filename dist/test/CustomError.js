"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CustomError extends Error {
    constructor() {
        super(...arguments);
        this.status = 400;
        this.name = "CustomError";
        this.code = "CustomError";
        this.extraData = true;
    }
}
exports.default = CustomError;
