import type { Worksheet } from "exceljs";

export function applyDefaultStyling(worksheet: Worksheet) {
    worksheet.eachRow((row, rowNumber) => {
        row.height = 30;
        for (let i = 1; i <= row.cellCount; ++i) {
            const cell = row.getCell(i);

            // Zebra
            if (rowNumber % 2 === 1) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFf5f5f5" },
                };
            } else {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "ffffffff" },
                };
            }

            cell.font = {
                color: { argb: "FF707070" },
            };

            // Header
            if (rowNumber === 1) {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFf5f5f5" },
                };

                cell.font = {
                    bold: true,
                };
            }

            cell.border = {
                right: {},
                left: {},
                top: {},
                bottom: {
                    style: "thin",
                    color: { argb: "FF707070" },
                },
            };
            cell.model.style.alignment = {
                vertical: "middle",
            };
        }
    });
}
