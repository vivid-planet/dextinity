import type { ContentScopePath } from "../Provider";
import { NullValueAsString } from "./nullValueAsString";

/**
 * Creates a path from the given dimension values.
 *
 * @param dimensionValues - An object where each key is a dimension and the value is a set of the values for that dimension.
 * @returns A path with one URL segment per dimension, allowing the dimension's values. `null` values are allowed as `-`, as `defaultCreateUrl` writes them.
 */
export function createPathFromDimensionValues(dimensionValues: { [dimension: string]: Set<unknown> }): ContentScopePath {
    return Object.keys(dimensionValues).map((dimension) => ({
        dimension,
        values: Array.from(dimensionValues[dimension], (value) => (value ? String(value) : NullValueAsString)),
    }));
}
