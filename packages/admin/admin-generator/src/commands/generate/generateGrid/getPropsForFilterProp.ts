import type { IntrospectionInputObjectType } from "graphql";

import type { GridConfig } from "../generate-command";
import type { Imports } from "../utils/generateImportsCode";
import type { Prop } from "./generateGrid";

export function getPropsForFilterProp<T extends { __typename?: string }>({
    config,
    filterType,
}: {
    config: GridConfig<T>;
    filterType: IntrospectionInputObjectType;
}): {
    hasFilterProp: boolean;
    imports: Imports;
    props: Prop[];
} {
    if (!config.filterProp) {
        return { hasFilterProp: false, imports: [], props: [] };
    }

    const filterTypeName = `GQL${filterType.name}`;

    return {
        hasFilterProp: true,
        imports: [{ name: filterTypeName, importPath: "@src/graphql.generated" }],
        props: [{ name: "filter", optional: true, type: filterTypeName }],
    };
}
