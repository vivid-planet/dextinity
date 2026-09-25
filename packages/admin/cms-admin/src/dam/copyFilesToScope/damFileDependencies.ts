import type { BlockDependency } from "../../blocks/types";
import type { GQLDamFile, GQLImageCropArea, GQLImageCropAreaInput } from "../../graphql.generated";
import type { DamFileToCopy } from "./copyDamFilesToScope";

type DamFileDependency = BlockDependency & { data?: { damFile?: GQLDamFile & { scope?: Record<string, unknown> } } };

export function isDamFileDependency(dependency: BlockDependency): dependency is DamFileDependency {
    return dependency.targetGraphqlObjectType === "DamFile";
}

function toImageCropAreaInput(cropArea: GQLImageCropArea): GQLImageCropAreaInput {
    return { focalPoint: cropArea.focalPoint, width: cropArea.width, height: cropArea.height, x: cropArea.x, y: cropArea.y };
}

export function damFilesFromDependencies(dependencies: BlockDependency[]): DamFileToCopy[] {
    return dependencies.filter(isDamFileDependency).map((dependency) => {
        const damFile = dependency.data?.damFile;
        const cropArea = damFile?.image?.cropArea;

        return {
            id: dependency.id,
            scope: damFile?.scope,
            imageCropArea: cropArea ? toImageCropAreaInput(cropArea) : undefined,
        };
    });
}
