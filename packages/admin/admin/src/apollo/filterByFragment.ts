import type { FragmentMatcher } from "@apollo/client";
import {
    argumentsObjectFromField,
    createFragmentMap,
    type DirectiveInfo,
    type FragmentMap,
    getFragmentDefinitions,
    getMainDefinition,
    isField,
    isInlineFragment,
    resultKeyNameFromField,
    shouldInclude,
} from "@apollo/client/utilities";
import type { DirectiveNode, DocumentNode, FieldNode, FragmentDefinitionNode, InlineFragmentNode, SelectionSetNode } from "graphql";

// Copied and adapted from https://github.com/apollographql/apollo-client/blob/release-2.x/packages/graphql-anywhere/src/utilities.ts
export function filterByFragment<FD = any, D extends FD = any>(doc: DocumentNode, data: D, variableValues: VariableMap = {}): FD {
    if (data === null) {
        return data;
    }

    const resolver = (fieldName: string, root: any, args: Record<string, any>, context: ExecContext, info: ExecInfo) => {
        return root[info.resultKey];
    };

    return Array.isArray(data)
        ? (data.map((dataObj) => graphql(resolver, doc, dataObj, null, variableValues)) as FD)
        : graphql(resolver, doc, data, null, variableValues);
}

// Copied and adapted from https://github.com/apollographql/apollo-client/blob/release-2.x/packages/graphql-anywhere/src/graphql.ts
type Resolver = (fieldName: string, rootValue: any, args: any, context: any, info: ExecInfo) => any;

type VariableMap = { [name: string]: any };

type ResultMapper = (values: { [fieldName: string]: any }, rootValue: any) => any;

type ExecContext = {
    fragmentMap: FragmentMap;
    contextValue: any;
    variableValues: VariableMap;
    resultMapper?: ResultMapper;
    resolver: Resolver;
    fragmentMatcher: FragmentMatcher;
};

type ExecInfo = {
    isLeaf: boolean;
    resultKey: string;
    directives: DirectiveInfo | null;
    field: FieldNode;
};

type ExecOptions = {
    resultMapper?: ResultMapper;
    fragmentMatcher?: FragmentMatcher;
};

/* Based on graphql function from graphql-js:
 *
 * graphql(
 *   schema: GraphQLSchema,
 *   requestString: string,
 *   rootValue?: ?any,
 *   contextValue?: ?any,
 *   variableValues?: ?{[key: string]: any},
 *   operationName?: ?string
 * ): Promise<GraphQLResult>
 *
 * The default export as of graphql-anywhere is sync as of 4.0,
 * but below is an exported alternative that is async.
 * In the 5.0 version, this will be the only export again
 * and it will be async
 */
function graphql(
    resolver: Resolver,
    document: DocumentNode,
    rootValue?: any,
    contextValue?: any,
    variableValues: VariableMap = {},
    execOptions: ExecOptions = {},
) {
    const mainDefinition = getMainDefinition(document);

    const fragments = getFragmentDefinitions(document);
    const fragmentMap = createFragmentMap(fragments);

    const resultMapper = execOptions.resultMapper;

    // Default matcher always matches all fragments
    const fragmentMatcher = execOptions.fragmentMatcher || (() => true);

    const execContext: ExecContext = {
        fragmentMap,
        contextValue,
        variableValues,
        resultMapper,
        resolver,
        fragmentMatcher,
    };

    return executeSelectionSet(mainDefinition.selectionSet as SelectionSetNode, rootValue, execContext);
}

function executeSelectionSet(selectionSet: SelectionSetNode, rootValue: any, execContext: ExecContext) {
    const { fragmentMap, contextValue, variableValues: variables } = execContext;

    const result: Record<string, any> = {};

    selectionSet.selections.forEach((selection) => {
        if (variables && !shouldInclude(selection, variables)) {
            // Skip selection sets which we're able to determine should not be run
            return;
        }

        if (isField(selection)) {
            const fieldResult = executeField(selection, rootValue, execContext);

            const resultFieldKey = resultKeyNameFromField(selection);

            if (fieldResult !== undefined) {
                if (result[resultFieldKey] === undefined) {
                    result[resultFieldKey] = fieldResult;
                } else {
                    merge(result[resultFieldKey], fieldResult);
                }
            }
        } else {
            let fragment: InlineFragmentNode | FragmentDefinitionNode;

            if (isInlineFragment(selection)) {
                fragment = selection;
            } else {
                // This is a named fragment
                fragment = fragmentMap[selection.name.value] as FragmentDefinitionNode;

                if (!fragment) {
                    throw new Error(`No fragment named ${selection.name.value}`);
                }
            }

            const typeCondition = fragment.typeCondition?.name.value;

            if (typeCondition && execContext.fragmentMatcher(rootValue, typeCondition, contextValue)) {
                const fragmentResult = executeSelectionSet(fragment.selectionSet, rootValue, execContext);

                merge(result, fragmentResult);
            }
        }
    });

    if (execContext.resultMapper) {
        return execContext.resultMapper(result, rootValue);
    }

    return result;
}

function executeField(field: FieldNode, rootValue: any, execContext: ExecContext): any {
    const { variableValues: variables, contextValue, resolver } = execContext;

    const fieldName = field.name.value;
    const args = argumentsObjectFromField(field, variables);

    const info: ExecInfo = {
        isLeaf: !field.selectionSet,
        resultKey: resultKeyNameFromField(field),
        directives: getDirectiveInfoFromField(field, variables),
        field,
    };

    const result = resolver(fieldName, rootValue, args, contextValue, info);

    // Handle all scalar types here
    if (!field.selectionSet) {
        return result;
    }

    // From here down, the field has a selection set, which means it's trying to
    // query a GraphQLObjectType
    if (result == null) {
        // Basically any field in a GraphQL response can be null, or missing
        return result;
    }

    if (Array.isArray(result)) {
        return executeSubSelectedArray(field, result, execContext);
    }

    // Returned value is an object, and the query has a sub-selection. Recurse.
    return executeSelectionSet(field.selectionSet, result, execContext);
}

function executeSubSelectedArray(field: FieldNode, result: any[], execContext: ExecContext): any[] {
    return result.map((item) => {
        // null value in array
        if (item === null) {
            return null;
        }

        // This is a nested array, recurse
        if (Array.isArray(item)) {
            return executeSubSelectedArray(field, item, execContext);
        }

        if (!field.selectionSet) {
            return null;
        }

        // This is an object, run the selection set on it
        return executeSelectionSet(field.selectionSet, item, execContext);
    });
}

const hasOwn = Object.prototype.hasOwnProperty;

function merge(dest: Record<string, any>, src: Record<string, any>) {
    if (src !== null && typeof src === "object") {
        Object.keys(src).forEach((key) => {
            const srcVal = src[key];
            if (!hasOwn.call(dest, key)) {
                dest[key] = srcVal;
            } else {
                merge(dest[key], srcVal);
            }
        });
    }
}

// Copied and adapted from https://github.com/apollographql/apollo-client/blob/release-2.x/packages/apollo-utilities/src/directives.ts

// Provides the methods that allow QueryManager to handle the `skip` and
// `include` directives within GraphQL.
function getDirectiveInfoFromField(field: FieldNode, variables: Record<string, any>): DirectiveInfo | null {
    if (field.directives && field.directives.length) {
        const directiveObj: DirectiveInfo = {};
        field.directives.forEach((directive: DirectiveNode) => {
            const argumentsObj = argumentsObjectFromField(directive, variables);
            if (argumentsObj) {
                directiveObj[directive.name.value] = argumentsObj;
            }
        });
        return directiveObj;
    }
    return null;
}
