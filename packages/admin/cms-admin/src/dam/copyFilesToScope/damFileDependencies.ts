import type { BlockDependency } from "../../blocks/types";
import type { GQLDamFile, GQLImageCropArea, GQLImageCropAreaInput } from "../../graphql.generated";
import type { DamFileToCopy } from "./copyDamFilesToScope";

type DamFileDependency = BlockDependency & { data: { damFile: GQLDamFile & { scope?: Record<string, unknown> } } };

export function isDamFileDependency(dependency: BlockDependency): dependency is DamFileDependency {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return dependency.targetGraphqlObjectType === "DamFile" && !!dependency.data && !!(dependency.data as any).damFile;
}

function toImageCropAreaInput(cropArea: GQLImageCropArea): GQLImageCropAreaInput {
    return { focalPoint: cropArea.focalPoint, width: cropArea.width, height: cropArea.height, x: cropArea.x, y: cropArea.y };
}

export function damFilesFromDependencies(dependencies: BlockDependency[]): DamFileToCopy[] {
    return dependencies.filter(isDamFileDependency).map(({ data: { damFile } }) => ({
        id: damFile.id,
        scope: damFile.scope,
        imageCropArea: damFile.image?.cropArea ? toImageCropAreaInput(damFile.image.cropArea) : undefined,
    }));
}
