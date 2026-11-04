import type { EntityMetadata } from "@mikro-orm/postgresql";

import { CRUD_FIELD_METADATA_KEY, type CrudFieldOptions } from "../decorators/crud-generator.decorator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasCrudFieldFeature(metadataClass: any, propName: string, option: keyof CrudFieldOptions): boolean {
    const crudField = (Reflect.getMetadata(CRUD_FIELD_METADATA_KEY, metadataClass, propName) ?? {}) as CrudFieldOptions;
    const defaultValue = option == "dedicatedResolverArg" ? false : true;
    return !!(crudField[option] ?? defaultValue);
}

export type CrudSearchField = {
    /**
     * The name of the field, which can be a simple property name or a nested property in the format "relation.property".
     *
     * @example
     * "title" for a simple property,
     * "author.name" for a nested property in a relation.
     */
    name: string;
    /**
     * Indicates whether the field needs to be cast to text for the search query.
     */
    needsCastToText: boolean;
};

export function getCrudSearchFieldsFromMetadata(metadata: EntityMetadata): CrudSearchField[] {
    return metadata.props
        .filter((prop) => prop.name != "status")
        .filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "search") && !prop.name.startsWith("scope_"))
        .reduce((acc, prop) => {
            if (prop.type === "string" || prop.type === "text" || prop.type === "uuid") {
                acc.push({ name: prop.name, needsCastToText: prop.type === "uuid" || prop.columnTypes.includes("uuid") });
            } else if (prop.kind == "m:1") {
                if (!prop.targetMeta) {
                    throw new Error(`reference ${prop.name} has no targetMeta`);
                }
                prop.targetMeta.props
                    .filter(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        (innerProp) => hasCrudFieldFeature(prop.targetMeta!.class, innerProp.name, "search") && !innerProp.name.startsWith("scope_"),
                    )
                    .forEach((innerProp) => {
                        if (innerProp.type === "string" || innerProp.type === "text" || innerProp.type === "uuid") {
                            acc.push({
                                name: `${prop.name}.${innerProp.name}`,
                                needsCastToText: innerProp.type === "uuid" || innerProp.columnTypes.includes("uuid"),
                            });
                        }
                    });
            }
            return acc;
        }, [] as CrudSearchField[]);
}
