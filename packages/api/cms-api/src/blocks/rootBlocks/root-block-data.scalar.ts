import { GraphQLScalarType } from "graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import type { Block } from "../block";

const rootBlockDataScalars = new Map<string, GraphQLScalarType>();

export function RootBlockDataScalar(block: Block): GraphQLScalarType {
    let scalar = rootBlockDataScalars.get(block.name);

    if (scalar !== undefined) {
        return scalar;
    }

    scalar = new GraphQLScalarType({
        ...GraphQLJSONObject,
        name: `${block.name}BlockData`,
        description: `${block.name} root block data`,
    });

    rootBlockDataScalars.set(block.name, scalar);

    return scalar;
}
