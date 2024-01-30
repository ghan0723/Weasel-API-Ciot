import * as fs from "fs";
import * as util from "util";

const log_stdout = process.stdout;

export const weasel = {
  log: function (arg1: any, arg2?: any, arg3?: any): void {
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
      }).write(
        "[" +
          timeString +
          "] (" +
          arg1 +
          "/" +
          filtered_arg2 +
          ") " +
          util.format(arg3) +
          "\n"
      );
    } else {
      fs.createWriteStream(dir + file, {
        flags: "a",
        encoding: "utf8",
        mode: 0o666,
      }).write("[" + timeString + "] " + util.format(arg1) + "\n");
    }
  },
  error: function (arg1: any, arg2?: any, arg3?: any): void {
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
      }).write(
        "[" +
          timeString +
          "] (" +
          arg1 +
          "/" +
          filtered_arg2 +
          ") " +
          util.format(arg3) +
          "\n"
      );
      log_stdout.write(
        "[" +
          timeString +
          "] (" +
          arg1 +
          "/" +
          filtered_arg2 +
          ") " +
          util.format(arg3) +
          "\n"
      );
    } else {
      fs.createWriteStream(dir + file, {
        flags: "a",
        encoding: "utf8",
        mode: 0o666,
      }).write("[" + timeString + "] " + util.format(arg1) + "\n");
      log_stdout.write("[" + timeString + "] " + util.format(arg1) + "\n");
    }
  },
};
