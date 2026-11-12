import type { ContentScopePath, ContentScopeValues } from "../Provider";
import { createPathFromDimensionValues } from "./createPathFromDimensionValues";
import { groupObjectsIntoArrays } from "./groupObjectsIntoArrays";

/**
 * Generates default paths based on the provided content scope values.
 *
 * @param values - The content scope values used to generate the paths.
 * @returns One path per group of scopes with the same dimensions.
 */
export function defaultCreatePath(values: ContentScopeValues): ContentScopePath[] {
    const paths: ContentScopePath[] = [];

    groupObjectsIntoArrays(values).forEach((value) => {
        const dimensionValues: { [dimension: string]: Set<unknown> } = {};
        value.forEach((innerValue: { scope: { [x: string]: unknown } }) => {
            Object.keys(innerValue.scope).forEach((dimension) => {
                if (!dimensionValues[dimension]) {
                    dimensionValues[dimension] = new Set();
                }
                dimensionValues[dimension].add(innerValue.scope[dimension]);
            });
        });
        const path = createPathFromDimensionValues(dimensionValues);
        paths.push(path);
    });

    return paths;
}
