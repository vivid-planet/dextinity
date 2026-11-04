import { existsSync } from "fs";
import type { IntrospectionObjectType, IntrospectionQuery } from "graphql";

const fallbackLibraryBlocks: { [key: string]: string } = {
    AnchorBlock: "@dextinity/cms-admin",
    DamImageBlock: "@dextinity/cms-admin",
    DamVideoBlock: "@dextinity/cms-admin",
    ExternalLinkBlock: "@dextinity/cms-admin",
    InternalLinkBlock: "@dextinity/cms-admin",
    PixelImageBlock: "@dextinity/cms-admin",
    SpaceBlock: "@dextinity/cms-admin",
    SvgImageBlock: "@dextinity/cms-admin",
    YouTubeVideoBlock: "@dextinity/cms-admin",
};

export function findRootBlocks({ gqlType, targetDirectory }: { gqlType: string; targetDirectory: string }, schema: IntrospectionQuery) {
    const ret: Record<string, { import: string; name: string }> = {};

    const schemaEntity = schema.__schema.types.find((type) => type.kind === "OBJECT" && type.name === gqlType) as IntrospectionObjectType | undefined;
    if (!schemaEntity) {
        throw new Error("didn't find entity in schema types");
    }
    schemaEntity.fields.forEach((field) => {
        if (ret[field.name]) {
            return;
        } // already defined
        let type = field.type;
        if (type.kind == "NON_NULL") {
            type = type.ofType;
        }
        if (type.kind == "SCALAR" && type.name.endsWith("BlockData")) {
            let match = false;
            const blockName = `${type.name.replace(/BlockData$/, "")}Block`;
            const checkNames = [
                {
                    folderName: `${targetDirectory.replace(/\/generated$/, "")}/blocks`,
                    import: `../blocks/${blockName}`,
                },
                {
                    folderName: `src/common/blocks`,
                    import: `@src/common/blocks/${blockName}`,
                },
            ];
            for (const checkName of checkNames) {
                if (existsSync(`${checkName.folderName}/${blockName}.tsx`)) {
                    match = true;
                    ret[field.name] = {
                        import: checkName.import,
                        name: blockName,
                    };
                    break;
                }
            }
            if (!match) {
                const fallback = fallbackLibraryBlocks[blockName];
                if (fallback) {
                    ret[field.name] = {
                        import: fallback,
                        name: blockName,
                    };
                    match = true;
                }
            }
            if (!match) {
                throw new Error(`Didn't find admin block for ${blockName} in ${checkNames.map((c) => c.folderName).join(" or ")}`);
            }
        }
    });

    return ret;
}
