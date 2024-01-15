"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ip_1 = __importDefault(require("ip"));
class IpCalcService {
    parseIPRange(ipRangeStr) {
        const ipRanges = ipRangeStr.split(",").map((range) => range.trim());
        const parsedRanges = ipRanges.map((range) => {
            if (range.includes("/")) {
                // CIDR 형식
                const cidrRange = ip_1.default.cidrSubnet(range);
                return {
                    start: cidrRange.networkAddress,
                    end: cidrRange.broadcastAddress,
                };
            }
            else if (range.includes("-")) {
                // 기본 IP 범위
                const [start, end] = range.split("-").map((ip) => ip.trim());
                return { start, end };
            }
            // 단일 IP
            return { start: range, end: range };
        });
        return parsedRanges;
    }
}
exports.default = IpCalcService;
