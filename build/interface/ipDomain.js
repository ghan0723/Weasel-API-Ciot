"use strict";
// import os from "os";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backIP = exports.frontIP = void 0;
// const interfaces = os.networkInterfaces();
// for (const name of Object.keys(interfaces)) {
//   if (interfaces[name] !== undefined) {
//     for (const iface of interfaces[name] ?? []) {
//       if (iface.family === "IPv4" && !iface.internal) {
//         console.log("iface.address : ", iface.address);
//         console.log("iface : ", iface);
//       }
//     }
//   }
// }
exports.frontIP = "https://172.31.168.112:3000";
exports.backIP = "https://172.31.168.112:8000";
