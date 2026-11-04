import { GraphQLScalarType } from "graphql";
import { GraphQLJSONObject } from "graphql-scalars";

import type { Block } from "../block";

const rootBlockInputScalars = new Map<string, GraphQLScalarType>();

export function RootBlockInputScalar(block: Block): GraphQLScalarType {
    let scalar = rootBlockInputScalars.get(block.name);

    if (scalar !== undefined) {
        return scalar;
    }

    scalar = new GraphQLScalarType({
        ...GraphQLJSONObject,
        name: `${block.name}BlockInput`,
        description: `${block.name} root block input`,
    });

    rootBlockInputScalars.set(block.name, scalar);

    return scalar;
}
