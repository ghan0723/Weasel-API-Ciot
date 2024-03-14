// import os from "os";

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

export const frontIP = "https://172.31.168.110:3000";
export const backIP = "https://172.31.168.110:8000";
