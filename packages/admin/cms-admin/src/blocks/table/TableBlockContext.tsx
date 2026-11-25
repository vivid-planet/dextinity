import type { SxProps, Theme } from "@mui/material/styles";
import { createContext, type ReactNode, useContext, useMemo } from "react";

import type { BlockInterface, ReadOnlyBlockRenderInterface } from "../types";
import type { TableCellSettings, TableSettingsDeclaration } from "./createTableSettings";

export type TableBlockConfig = {
    CellBlock: BlockInterface & ReadOnlyBlockRenderInterface;
    rowSettings: TableSettingsDeclaration;
    columnSettings: TableSettingsDeclaration;
    getCellStyle?: (cell: TableCellSettings) => SxProps<Theme>;
};

const TableBlockContext = createContext<TableBlockConfig | undefined>(undefined);

const noSettings: TableSettingsDeclaration = {};

type TableBlockContextProviderProps = Pick<TableBlockConfig, "CellBlock" | "getCellStyle"> &
    Partial<Pick<TableBlockConfig, "rowSettings" | "columnSettings">> & {
        children: ReactNode;
    };

export const TableBlockContextProvider = ({
    CellBlock,
    rowSettings = noSettings,
    columnSettings = noSettings,
    getCellStyle,
    children,
}: TableBlockContextProviderProps) => {
    const value = useMemo(() => ({ CellBlock, rowSettings, columnSettings, getCellStyle }), [CellBlock, rowSettings, columnSettings, getCellStyle]);

    return <TableBlockContext.Provider value={value}>{children}</TableBlockContext.Provider>;
};

export const useTableBlockContext = (): TableBlockConfig => {
    const context = useContext(TableBlockContext);
    if (!context) {
        throw new Error("useTableBlockContext must be used within a TableBlockContextProvider");
    }
    return context;
};
