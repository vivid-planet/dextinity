export type CellPosition = {
    columnId: string;
    rowId: string;
};

const cellKeySeparator = ":";

export const createCellKey = ({ columnId, rowId }: CellPosition) => `${columnId}${cellKeySeparator}${rowId}`;

export const createCellRoute = (tableRoute: string, cell: CellPosition) => `${tableRoute}#${createCellKey(cell)}`;

export const parseCellHash = (hash: string): CellPosition | undefined => {
    const [columnId, rowId] = hash.replace(/^#/, "").split(cellKeySeparator);
    if (!columnId || !rowId) {
        return undefined;
    }
    return { columnId, rowId };
};
