import type { BlockDataInterface } from "../../block.js";

interface BlockDataConstructorInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): BlockDataInterface;
}

// ClassDecorator for BlockData-Class
// adds the current version to the returned value in transformToSave
export function BlockDataMigrationVersion(versionNumber: number) {
    return function BlockDataMigrationVersionClassDecorator(constructor: BlockDataConstructorInterface): void {
        if (versionNumber > 0) {
            const originalTransformToSave = constructor.prototype.transformToSave;

            // Decorate original transformToSave
            // add version number before saving
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor.prototype.transformToSave = function (...args: any[]) {
                const result = originalTransformToSave.apply(this, args);

                return {
                    ...result,
                    $$version: versionNumber,
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
                }
                return result;
            };
        }
    };
}
