import type { GridColDef } from "./GridColDef";

export const renderStaticSelectCell: GridColDef["renderCell"] = ({ value, colDef }) => {
    // TODO: find a better solution than as cast
    const gridColDef = colDef as GridColDef;
    if (Array.isArray(gridColDef.valueOptions)) {
        const renderCellValue = gridColDef.valueOptions.find((option) => {
            return typeof option === "object" && option.value === value ? value.toString() : "";
        });

        if (typeof renderCellValue === "object") {
            if ("cellContent" in renderCellValue) {
                return renderCellValue.cellContent;
            }

            return renderCellValue.label;
        }
    }

    return value ? value.toString() : "";
};
