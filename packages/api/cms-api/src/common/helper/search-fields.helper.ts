import type { EntityMetadata } from "@mikro-orm/postgresql";

import { EXCLUDE_FROM_SEARCH_METADATA_KEY } from "../decorators/exclude-from-search.decorator.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isExcludedFromSearch(metadataClass: any, propName: string): boolean {
    return Reflect.getMetadata(EXCLUDE_FROM_SEARCH_METADATA_KEY, metadataClass, propName) === true;
}

export type SearchField = {
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

export function getSearchFieldsFromMetadata(metadata: EntityMetadata): SearchField[] {
    return metadata.props
        .filter((prop) => prop.name != "status")
        .filter((prop) => !isExcludedFromSearch(metadata.class, prop.name) && !prop.name.startsWith("scope_"))
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
                        (innerProp) => !isExcludedFromSearch(prop.targetMeta!.class, innerProp.name) && !innerProp.name.startsWith("scope_"),
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
        }, [] as SearchField[]);
}
