import { circularDeepEqual } from "fast-equals";

import type { BlockDependency } from "../types";

export function deduplicateBlockDependencies(arr: BlockDependency[]) {
    const deduplicatedArr: BlockDependency[] = [];

    for (const dependency of arr) {
        // BlockDependency.data is unknown, so applications can put circular structures in it
        const existingIdenticalDependency = deduplicatedArr.find((existingDependency) => circularDeepEqual(dependency, existingDependency));
        if (existingIdenticalDependency === undefined) {
            deduplicatedArr.push(dependency);
        }
    }

    return deduplicatedArr;
}
