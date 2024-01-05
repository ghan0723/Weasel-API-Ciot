"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class OutlookService {
    getCountAll() {
        return new Promise((resolve, reject) => {
            const query = "select count(*) as alloutlooks from outlookpstviewer where time like '%2022-08-17%'";
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
}
exports.default = OutlookService;
