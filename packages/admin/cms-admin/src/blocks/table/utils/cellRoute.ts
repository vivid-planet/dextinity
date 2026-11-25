export type CellPosition = {
    columnId: string;
    rowId: string;
};

const cellKeySeparator = ":";

export const createCellKey = ({ columnId, rowId }: CellPosition) => `${columnId}${cellKeySeparator}${rowId}`;

export const createCellRoute = (tableRoute: string, cell: CellPosition) => `${tableRoute}#${createCellKey(cell)}`;

export const parseCellHash = (hash: string): CellPosition | undefined => {
    // Blocks in a cell append their own route to the cell route, e.g. `#columnId:rowId#text` or `#columnId:rowId/text/text`
    const [cellKey] = hash.replace(/^#/, "").split(/[#/]/);
    const [columnId, rowId] = cellKey.split(cellKeySeparator);
    if (!columnId || !rowId) {
        return undefined;
    }
    return { columnId, rowId };
};
