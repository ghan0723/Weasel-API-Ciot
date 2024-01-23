import * as Excel from "exceljs";
import { saveAs } from "file-saver";
import { promises as fsPromises } from "fs";

const headerWidths: number[] = [
  15, 20, 24, 24, 24, 24, 20, 24, 15, 20, 15, 40, 40, 40, 20, 24,
];

class ExcelService {
  async getExcelFile(
    fileData: any[],
    fileName: string
  ) {
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
  }

  styleHeaderCell = (cell: any) => {
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

  styleDataCell = (cell: any) => {
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

export default ExcelService;
