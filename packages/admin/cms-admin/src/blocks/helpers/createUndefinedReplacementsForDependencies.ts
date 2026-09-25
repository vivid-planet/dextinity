import type { BlockDependency, ReplaceDependencyObject } from "../types";

/**
 * Creates replacements that remove the passed dependencies, e.g., links to pages that don't exist in the scope a block is pasted into.
 */
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
