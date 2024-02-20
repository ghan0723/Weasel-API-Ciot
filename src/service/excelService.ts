import * as Excel from "exceljs";
import { saveAs } from "file-saver";
import { promises as fsPromises } from "fs";
import moment from "moment";

class ExcelService {
  async getExcelFile(fileData: any[], fileName: string) {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet(`${fileName}`);
    const headers = Object.keys(fileData[0]);
    const headerRow = sheet.addRow(headers);
    headerRow.height = 30.75;
    headerRow.eachCell((cell, colNum) => {
      this.styleHeaderCell(cell);
    });

    fileData.forEach((item) => {
        const rowData: any[] = Object.values(item);
        console.log("rowData : ", rowData);
        const appendRow = sheet.addRow(rowData);
        appendRow.eachCell((cell, colNum) => {
          this.styleDataCell(cell);
      
          if (typeof rowData[colNum - 1] === 'string') {
            sheet.getColumn(colNum).width =
              rowData[colNum - 1]?.length < 20
                ? rowData[colNum - 1]?.length + 15
                : rowData[colNum - 1]?.length + 30;
          } else if (rowData[colNum - 1] instanceof Date) {
            const formattedDate = moment(rowData[colNum - 1]).format('YYYY-MM-DD HH:mm:ss');
            sheet.getColumn(colNum).width =
              formattedDate.length < 20
                ? formattedDate.length + 15
                : formattedDate.length + 30;
          } else if (typeof rowData[colNum - 1] === 'number') {
            const numString = rowData[colNum - 1].toString();
            sheet.getColumn(colNum).width =
              numString.length < 20
                ? numString.length + 15
                : numString.length + 30;
          } else {
            // Handle other data types as needed
          }

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
