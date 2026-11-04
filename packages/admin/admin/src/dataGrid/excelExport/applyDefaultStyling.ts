import type { Worksheet } from "exceljs";

export function applyDefaultStyling(worksheet: Worksheet) {
    worksheet.eachRow((row, rowNumber) => {
        row.height = 30;
        for (let i = 1; i <= row.cellCount; ++i) {
            const cell = row.getCell(i);

            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: rowNumber % 2 === 1 ? "FFf5f5f5" : "ffffffff" },
            };

            cell.font = {
                color: { argb: "FF707070" },
            };

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
