export const safeColumnGet = (row: any, path: string): string | number | null => {
    const splitPath = path.split(".");
    const nextRow = row[splitPath[0]];
    if (!nextRow) {
        return null;
    }

    if (splitPath.length === 1) {
        return nextRow;
    }

    const remainingPath = splitPath.slice(1).join(".");
    return safeColumnGet(nextRow, remainingPath);
};
