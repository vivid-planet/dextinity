import type { ContentScopeValues } from "../Provider";
import { createPathFromDimensionValues } from "./createPathFromDimensionValues";
import { groupObjectsIntoArrays } from "./groupObjectsIntoArrays";

/**
 * Generates default paths based on the provided content scope values.
 *
 * @param values - The content scope values used to generate the paths.
 * @returns An array of generated paths.
 */
export function defaultCreatePath(values: ContentScopeValues) {
    const paths: string[] = [];

    groupObjectsIntoArrays(values).forEach((value) => {
        const dimensionValues: { [dimension: string]: Set<string> } = {};
        value.forEach((innerValue: { scope: { [x: string]: string } }) => {
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
