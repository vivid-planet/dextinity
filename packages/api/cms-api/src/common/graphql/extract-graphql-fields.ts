import type { GraphQLResolveInfo } from "graphql";
import { parseResolveInfo, type ResolveTree } from "graphql-parse-resolve-info";

export function extractGraphqlFields(info: GraphQLResolveInfo, options: { root?: string } = {}): string[] {
    const resolveTree = parseResolveInfo(info) as ResolveTree;
    function treeToList(resolveTree: ResolveTree): string[] {
        const ret = [];
        for (const typeName in resolveTree.fieldsByTypeName) {
            const fields = resolveTree.fieldsByTypeName[typeName];
            for (const fieldName in fields) {
                ret.push(fields[fieldName].name);
                for (const i of treeToList(fields[fieldName])) {
                    ret.push(`${fields[fieldName].name}.${i}`);
                }
            }
        }
        return ret;
    }
    return treeToList(resolveTree).reduce((acc, i) => {
        if (!options.root) {
            return [...acc, i];
        }
        if (!i.startsWith(`${options.root}.`)) {
            return acc;
        }
        return [...acc, i.substring(options.root.length + 1)];
    }, [] as string[]);
}
