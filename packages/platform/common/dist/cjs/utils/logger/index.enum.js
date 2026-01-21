"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerTrigger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["Info"] = "log";
    LogLevel["Warn"] = "warn";
    LogLevel["Error"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var LoggerTrigger;
(function (LoggerTrigger) {
    LoggerTrigger["On"] = "on";
    LoggerTrigger["Off"] = "off";
})(LoggerTrigger || (exports.LoggerTrigger = LoggerTrigger = {}));
