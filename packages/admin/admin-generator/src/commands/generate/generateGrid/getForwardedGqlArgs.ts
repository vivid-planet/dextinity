import type { IntrospectionField, IntrospectionInputValue } from "graphql";

import type { Imports } from "../utils/generateImportsCode";
import type { Prop } from "./generateGrid";

export type GqlArg = { type: string; name: string; queryOrMutationName: string };

export function getForwardedGqlArgs(gqlFields: IntrospectionField[]) {
    const ret: {
        imports: Imports;
        prop: Prop;
        gqlArg: GqlArg;
    }[] = [];

    const supportedGqlArgs = ["offset", "limit", "sort", "search", "filter", "input"]; // this arguments need to be handled differently or are already handled somewhere else

    getArgs(gqlFields, supportedGqlArgs).forEach((arg) => {
        let prop: Prop;
        const imports: Imports = [];

        if (arg.type === "ID" || arg.type === "String" || arg.type === "DateTime") {
            prop = { name: arg.name, optional: false, type: "string" };
        } else if (arg.type === "Boolean") {
            prop = { name: arg.name, optional: false, type: "boolean" };
        } else if (arg.type === "Int" || arg.type === "Float") {
            prop = { name: arg.name, optional: false, type: "number" };
        } else if (arg.type === "JSONObject") {
            prop = { name: arg.name, optional: false, type: "unknown" };
        } else {
            prop = { name: arg.name, optional: false, type: `GQL${arg.type}` }; // generated types contain GQL prefix
            imports.push({ name: `GQL${arg.type}`, importPath: "@src/graphql.generated" });
        }

        ret.push({ gqlArg: { name: arg.name, type: arg.type, queryOrMutationName: arg.gqlField.name }, prop, imports });
    });

    return ret;
}

function getArgs(gqlFields: IntrospectionField[], skipGqlArgs: string[]) {
    return gqlFields.reduce<{ name: string; type: string; gqlArg: IntrospectionInputValue; gqlField: IntrospectionField }[]>((acc, gqlField) => {
        gqlField.args.forEach((gqlArg) => {
            if (skipGqlArgs.includes(gqlArg.name)) {
                return acc;
            }
            if (gqlArg.type.kind !== "NON_NULL" || gqlArg.defaultValue) {
                return acc;
            }

            const gqlType = gqlArg.type.ofType;

            let type = "unknown";
            if (gqlType.kind === "SCALAR") {
                const nativeScalars = ["ID", "String", "Boolean", "Int", "Float", "DateTime", "JSONObject"];
                if (!nativeScalars.includes(gqlType.name)) {
                    // probably just add to gqlFields-array, but needs to be tested
                    console.warn(`Currently not supported special SCALAR of type ${gqlType.name} in param ${gqlArg.name} of ${gqlField.name}`);
                } else {
                    type = gqlType.name;
                }
            } else if (gqlType.kind === "INPUT_OBJECT") {
                type = gqlType.name;
            } else {
                throw new Error(`Not supported kind ${gqlType.kind}, arg: ${gqlArg.name}`);
            }

            acc.push({ name: gqlArg.name, type, gqlArg, gqlField });
        });
        return acc;
    }, []);
}
