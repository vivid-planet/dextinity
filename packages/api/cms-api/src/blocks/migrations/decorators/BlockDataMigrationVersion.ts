import type { BlockDataInterface } from "../../block";

interface BlockDataConstructorInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): BlockDataInterface;
}

// ClassDecorator for BlockData-Class
// adds the current version to the returned value in transformToSave
export function BlockDataMigrationVersion(versionNumber: number, scopeVersions?: Record<string, number>) {
    return function BlockDataMigrationVersionClassDecorator(constructor: BlockDataConstructorInterface): void {
        const scopeVersionsToSave = Object.fromEntries(Object.entries(scopeVersions ?? {}).filter(([, version]) => version > 0));
        const hasScopeVersions = Object.keys(scopeVersionsToSave).length > 0;

        if (versionNumber > 0 || hasScopeVersions) {
            const originalTransformToSave = constructor.prototype.transformToSave;

            // Decorate original transformToSave
            // add version number before saving
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor.prototype.transformToSave = function (...args: any[]) {
                const result = originalTransformToSave.apply(this, args);

                return {
                    ...result,
                    ...(versionNumber > 0 ? { $$version: versionNumber } : {}),
                    ...(hasScopeVersions ? { $$versions: scopeVersionsToSave } : {}),
                };
            };

            const originalTransformToPlain = constructor.prototype.transformToPlain;

            // Decorate original transformToPlain
            // remove version number
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor.prototype.transformToPlain = async function (...args: any[]) {
                const result = await originalTransformToPlain.apply(this, args);

                if (typeof result === "object" && result !== null) {
                    if ("$$version" in result) {
                        delete result.$$version;
                    }
                    if ("$$versions" in result) {
                        delete result.$$versions;
                    }
                }
                return result;
            };
        }
    };
}
