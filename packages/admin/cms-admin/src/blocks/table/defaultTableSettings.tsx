import { DensityStandard } from "@dextinity/admin-icons";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { FormattedMessage } from "react-intl";

import { createTableSettings, type TableCellSettings, type TableColumnWidth, type TableSettingsState } from "./createTableSettings";

/**
 * The column settings of a table that doesn't pass `columnSettings`.
 * Extend them with `createTableSettings({ ...defaultTableColumnSettings, background: … })`.
 */
export const defaultTableColumnSettings = createTableSettings({
    size: {
        type: "select",
        label: <FormattedMessage id="dextinity.tableBlock.columnWidth" defaultMessage="Column width" />,
        icon: <DensityStandard />,
        options: [
            { value: "extraSmall", label: <FormattedMessage id="dextinity.tableBlock.columnSize.extraSmall" defaultMessage="Extra small" /> },
            { value: "small", label: <FormattedMessage id="dextinity.tableBlock.columnSize.small" defaultMessage="Small" /> },
            { value: "standard", label: <FormattedMessage id="dextinity.tableBlock.columnSize.standard" defaultMessage="Standard" /> },
            { value: "large", label: <FormattedMessage id="dextinity.tableBlock.columnSize.large" defaultMessage="Large" /> },
            { value: "extraLarge", label: <FormattedMessage id="dextinity.tableBlock.columnSize.extraLarge" defaultMessage="Extra large" /> },
        ],
        defaultValue: "standard",
    },
    highlighted: {
        type: "checkbox",
        label: <FormattedMessage id="dextinity.tableBlock.highlightColumn" defaultMessage="Highlight column" />,
        defaultValue: false,
    },
});

/**
 * The row settings of a table that doesn't pass `rowSettings`.
 * Extend them with `createTableSettings({ ...defaultTableRowSettings, bold: … })`.
 */
export const defaultTableRowSettings = createTableSettings({
    highlighted: {
        type: "checkbox",
        label: <FormattedMessage id="dextinity.tableBlock.highlightRow" defaultMessage="Highlight row" />,
        defaultValue: false,
    },
});

/**
 * The default `getCellStyle`: gives the cells of a highlighted row or column a background.
 * Combine it with the styles of a custom `getCellStyle`, e.g. `(cell) => ({ ...getHighlightedTableCellStyle(cell), fontWeight: … })`.
 */
export const getHighlightedTableCellStyle = ({ rowSettings, columnSettings }: TableCellSettings): SystemStyleObject<Theme> =>
    rowSettings.highlighted === true || columnSettings.highlighted === true ? { backgroundColor: "grey.50" } : {};

type ColumnSize = "extraSmall" | "small" | "standard" | "large" | "extraLarge";

const widthForColumnSize: Record<ColumnSize, number> = {
    extraSmall: 100,
    small: 200,
    standard: 300,
    large: 400,
    extraLarge: 500,
};

const flexForColumnSize: Record<ColumnSize, number> = {
    extraSmall: 1,
    small: 2,
    standard: 3,
    large: 4,
    extraLarge: 5,
};

const isColumnSize = (value: unknown): value is ColumnSize => typeof value === "string" && Object.keys(widthForColumnSize).includes(value);

/**
 * The default `getColumnWidth`: reads the width from the `size` setting of `defaultTableColumnSettings`.
 * A column without a known size is as wide as a standard column.
 */
export const getTableColumnWidthFromSize = ({ size }: TableSettingsState): TableColumnWidth => {
    const columnSize = isColumnSize(size) ? size : "standard";

    return { minWidth: widthForColumnSize[columnSize], flex: flexForColumnSize[columnSize] };
};
