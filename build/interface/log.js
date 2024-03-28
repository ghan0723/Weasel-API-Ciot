"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weasel = void 0;
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const log_stdout = process.stdout;
exports.weasel = {
    log: function (arg1, arg2, arg3) {
        const today = new Date();
        const year = today.getFullYear();
        const month = ("0" + (1 + today.getMonth())).slice(-2);
        const day = ("0" + today.getDate()).slice(-2);
        const dir = "logs/" + year + "/" + year + "-" + month + "/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const hours = ("0" + today.getHours()).slice(-2);
        const minutes = ("0" + today.getMinutes()).slice(-2);
        const seconds = ("0" + today.getSeconds()).slice(-2);
        const timeString = hours + ":" + minutes + ":" + seconds;
        const file = year + "-" + month + "-" + day + ".log";
        if (arg2 !== undefined) {
            const filtered_arg2 = arg2.split(/[:]+/).pop();
            fs.createWriteStream(dir + file, {
                flags: "a",
                encoding: "utf8",
                mode: 0o666,
            }).write("[" +
                timeString +
                "] (" +
                arg1 +
                "/" +
                filtered_arg2 +
                ") " +
                util.format(arg3) +
                "\n");
        }
        else {
            fs.createWriteStream(dir + file, {
                flags: "a",
                encoding: "utf8",
                mode: 0o666,
            }).write("[" + timeString + "] " + util.format(arg1) + "\n");
        }
    },
    error: function (arg1, arg2, arg3) {
        const today = new Date();
        const year = today.getFullYear();
        const month = ("0" + (1 + today.getMonth())).slice(-2);
        const day = ("0" + today.getDate()).slice(-2);
        const dir = "logs-err/" + year + "/" + year + "-" + month + "/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const hours = ("0" + today.getHours()).slice(-2);
        const minutes = ("0" + today.getMinutes()).slice(-2);
        const seconds = ("0" + today.getSeconds()).slice(-2);
        const timeString = hours + ":" + minutes + ":" + seconds;
        const file = year + "-" + month + "-" + day + ".log";
        if (arg2 !== undefined) {
            const filtered_arg2 = arg2.split(/[:]+/).pop();
            fs.createWriteStream(dir + file, {
                flags: "a",
                encoding: "utf8",
                mode: 0o666,
            }).write("[" +
                timeString +
                "] (" +
                arg1 +
                "/" +
                filtered_arg2 +
                ") " +
                util.format(arg3) +
                "\n");
            log_stdout.write("[" +
                timeString +
                "] (" +
                arg1 +
                "/" +
                filtered_arg2 +
                ") " +
                util.format(arg3) +
                "\n");
        }
        else {
            fs.createWriteStream(dir + file, {
                flags: "a",
                encoding: "utf8",
                mode: 0o666,
            }).write("[" + timeString + "] " + util.format(arg1) + "\n");
            log_stdout.write("[" + timeString + "] " + util.format(arg1) + "\n");
        }
    },
};
