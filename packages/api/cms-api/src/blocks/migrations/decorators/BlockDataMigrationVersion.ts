import type { BlockDataInterface } from "../../block";

interface BlockDataConstructorInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): BlockDataInterface;
}

// ClassDecorator for BlockData-Class
// adds the current versions to the returned value in transformToSave
export function BlockDataMigrationVersion(versionNumber = 0, vendorVersionNumber = 0) {
    return function BlockDataMigrationVersionClassDecorator(constructor: BlockDataConstructorInterface): void {
        if (versionNumber > 0 || vendorVersionNumber > 0) {
            const originalTransformToSave = constructor.prototype.transformToSave;

            // Decorate original transformToSave
            // add version numbers before saving
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor.prototype.transformToSave = function (...args: any[]) {
                const result = originalTransformToSave.apply(this, args);

                return {
                    ...result,
                    ...(versionNumber > 0 ? { $$version: versionNumber } : {}),
                    ...(vendorVersionNumber > 0 ? { $$vendorVersion: vendorVersionNumber } : {}),
                };
            };

            const originalTransformToPlain = constructor.prototype.transformToPlain;

            // Decorate original transformToPlain
            // remove version numbers
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor.prototype.transformToPlain = async function (...args: any[]) {
                const result = await originalTransformToPlain.apply(this, args);

                if (typeof result === "object" && result !== null) {
                    if ("$$version" in result) {
                        delete result.$$version;
                    }
                    if ("$$vendorVersion" in result) {
                        delete result.$$vendorVersion;
                    }
                }
                return result;
            };
        }
    };
}
