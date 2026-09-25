import type { BlockDependency, ReplaceDependencyObject } from "../types";

export function createUndefinedReplacementsForDependencies(dependencies: Array<Pick<BlockDependency, "targetGraphqlObjectType" | "id">>) {
    const existingReplacements = new Set();
    const replacements: ReplaceDependencyObject[] = [];

    for (const dependency of dependencies) {
        const key = `${dependency.targetGraphqlObjectType}#${dependency.id}`;

        if (!existingReplacements.has(key)) {
            replacements.push({ type: dependency.targetGraphqlObjectType, originalId: dependency.id, replaceWithId: undefined });
            existingReplacements.add(key);
        }
    }

    return replacements;
}
