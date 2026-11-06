import type { DataGridSort } from "@dextinity/ui";

/**
 * The sort of a `DataGrid` as the sort input of a GraphQL list query. `getField` maps a column key to the API's sort field
 * when they differ.
 */
export function toGqlSort<Field extends string = string>(
    sort: DataGridSort | undefined,
    getField: (columnKey: string) => Field = (columnKey) => columnKey as Field,
): Array<{ field: Field; direction: "ASC" | "DESC" }> | undefined {
    if (sort === undefined) {
        return undefined;
    }
    return [{ field: getField(sort.key), direction: sort.direction === "asc" ? "ASC" : "DESC" }];
}
