import { deepEqual as isEqual } from "fast-equals";

import type { BlockDependency } from "../types";

export function deduplicateBlockDependencies(arr: BlockDependency[]) {
    const deduplicatedArr: BlockDependency[] = [];

    for (const dependency of arr) {
        const existingIdenticalDependency = deduplicatedArr.find((existingDependency) => isEqual(dependency, existingDependency));
        if (existingIdenticalDependency === undefined) {
            deduplicatedArr.push(dependency);
        }
    }

    return deduplicatedArr;
}
