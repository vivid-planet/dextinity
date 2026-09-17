import type { BlockDependency } from "../../blocks/types";
import type { GQLDamFile } from "../../graphql.generated";
import type { DamFileToCopy } from "./copyDamFilesToScope";

type DamFileDependency = BlockDependency & { data: { damFile: GQLDamFile & { scope?: Record<string, unknown> } } };

export function isDamFileDependency(dependency: BlockDependency): dependency is DamFileDependency {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dependency.targetGraphqlObjectType === "DamFile" && !!dependency.data && !!(dependency.data as any).damFile;
}

/**
 * Extracts the DAM files referenced by the passed dependencies.
 *
 * The scope of a file is only known when the block's state originates from the API. For files that were selected in the
 * Admin without reloading the block, the scope is undefined and must be substituted by the caller.
 */
export function damFilesFromDependencies(dependencies: BlockDependency[]): DamFileToCopy[] {
    return dependencies.filter(isDamFileDependency).map(({ data: { damFile } }) => {
        const cropArea = damFile.image?.cropArea;

        return {
            id: damFile.id,
            scope: damFile.scope,
            // Map the crop area explicitly: when it originates from a GraphQL result it carries a __typename, which the input type rejects
            imageCropArea: cropArea
                ? { focalPoint: cropArea.focalPoint, width: cropArea.width, height: cropArea.height, x: cropArea.x, y: cropArea.y }
                : undefined,
        };
    });
}
