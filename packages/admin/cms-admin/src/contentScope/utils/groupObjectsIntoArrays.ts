import type { ContentScopeValues } from "../Provider";

/**
 * Groups objects into arrays based on their keys.
 *
 * This function takes an array of objects and groups them into arrays where each group contains objects
 * that have the same set of keys. The keys are sorted and serialized to form a unique key for each group.
 * Example:
 * - input: [{a: 1, b: 2}, {a: 1, b: 3}, {c: 2, a: 3}, {c: 4}]
 * - output: [[{a: 1, b: 2}, {a: 1, b: 3}], [{c: 2, a: 3}], [{c: 4}]]
 *
 * @param values - An array of objects to be grouped.
 * @returns An array of arrays, where each inner array contains objects that have the same set of keys.
 */
export function groupObjectsIntoArrays(values: ContentScopeValues) {
    const grouped = new Map();
    values.forEach((item) => {
        const key = JSON.stringify(Object.keys(item.scope).sort());
        if (grouped.has(key)) {
            grouped.get(key).push(item);
        } else {
            grouped.set(key, [item]);
        }
    });
    return Array.from(grouped.values());
}
