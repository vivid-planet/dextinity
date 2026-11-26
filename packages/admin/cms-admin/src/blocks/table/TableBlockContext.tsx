import type { SxProps, Theme } from "@mui/material/styles";
import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { BlockInterface, ReadOnlyBlockRenderInterface } from "../types";
import type { TableCellSettings, TableColumnWidth, TableSettingsDeclaration, TableSettingsState } from "./createTableSettings";
import { getHighlightedTableCellStyle, getTableColumnWidthFromSize } from "./defaultTableSettings";

export type TableBlockConfig = {
    CellBlock: BlockInterface & ReadOnlyBlockRenderInterface;
    rowSettings: TableSettingsDeclaration;
    columnSettings: TableSettingsDeclaration;
    getCellStyle: (cell: TableCellSettings) => SxProps<Theme>;
    getColumnWidth: (columnSettings: TableSettingsState) => TableColumnWidth;
};

const TableBlockContext = createContext<TableBlockConfig | undefined>(undefined);

const noSettings: TableSettingsDeclaration = {};

type TableBlockContextProviderProps = Pick<TableBlockConfig, "CellBlock"> &
    Partial<Omit<TableBlockConfig, "CellBlock">> & {
        children: ReactNode;
    };

export const TableBlockContextProvider = ({
    CellBlock,
    rowSettings = noSettings,
    columnSettings = noSettings,
    getCellStyle = getHighlightedTableCellStyle,
    getColumnWidth = getTableColumnWidthFromSize,
    children,
}: TableBlockContextProviderProps) => {
    const value = useMemo(
        () => ({ CellBlock, rowSettings, columnSettings, getCellStyle, getColumnWidth }),
        [CellBlock, rowSettings, columnSettings, getCellStyle, getColumnWidth],
    );

    return <TableBlockContext.Provider value={value}>{children}</TableBlockContext.Provider>;
};

export const useTableBlockContext = (): TableBlockConfig => {
    const context = useContext(TableBlockContext);
    if (!context) {
        throw new Error("useTableBlockContext must be used within a TableBlockContextProvider");
    }
    return context;
};
