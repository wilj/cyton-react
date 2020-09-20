"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloCyton = void 0;
var react_1 = __importDefault(require("react"));
function HelloCyton(_a) {
    var message = _a.message;
    return react_1.default.createElement("div", null,
        "Message: ",
        message);
}
exports.HelloCyton = HelloCyton;
