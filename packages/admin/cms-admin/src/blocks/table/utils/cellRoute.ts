export type CellPosition = {
    rowId: string;
    columnId: string;
};

const cellKeySeparator = ":";

export const createCellKey = ({ rowId, columnId }: CellPosition) => `${rowId}${cellKeySeparator}${columnId}`;

export const createCellRoute = (tableRoute: string, cell: CellPosition) => `${tableRoute}#${createCellKey(cell)}`;

export const parseCellHash = (hash: string): CellPosition | undefined => {
    const [rowId, columnId] = hash.replace(/^#/, "").split(cellKeySeparator);
    if (!rowId || !columnId) {
        return undefined;
    }
    return { rowId, columnId };
};
