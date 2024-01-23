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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Excel = __importStar(require("exceljs"));
const headerWidths = [
    15, 20, 24, 24, 24, 24, 20, 24, 15, 20, 15, 40, 40, 40, 20, 24,
];
class ExcelService {
    constructor() {
        this.styleHeaderCell = (cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ffebebeb" },
            };
            cell.border = {
                bottom: { style: "thin", color: { argb: "-100000f" } },
                right: { style: "thin", color: { argb: "-100000f" } },
            };
            cell.font = {
                name: "Arial",
                size: 12,
                bold: true,
                color: { argb: "ff252525" },
            };
            cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
            };
        };
        this.styleDataCell = (cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "ffffffff" },
            };
            cell.border = {
                bottom: { style: "thin", color: { argb: "-100000f" } },
                right: { style: "thin", color: { argb: "-100000f" } },
            };
            cell.font = {
                name: "Arial",
                size: 10,
                color: { argb: "ff252525" },
            };
            cell.alignment = {
                vertical: "middle",
                horizontal: "center",
                wrapText: true,
            };
        };
    }
    getExcelFile(fileData, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            const workbook = new Excel.Workbook();
            const sheet = workbook.addWorksheet(`${fileName}`);
            const headers = Object.keys(fileData[0]);
            console.log("headers : ", headers);
            const headerRow = sheet.addRow(headers);
            headerRow.height = 30.75;
            headerRow.eachCell((cell, colNum) => {
                this.styleHeaderCell(cell);
                sheet.getColumn(colNum).width = headerWidths[colNum - 1];
            });
            fileData.forEach((item) => {
                const rowData = Object.values(item);
                const appendRow = sheet.addRow(rowData);
                appendRow.eachCell((cell, colNum) => {
                    this.styleDataCell(cell);
                    if (colNum === 1) {
                        cell.font = {
                            color: { argb: "ff1890ff" },
                        };
                    }
                });
            });
            return workbook.xlsx.writeBuffer();
        });
    }
}
exports.default = ExcelService;
