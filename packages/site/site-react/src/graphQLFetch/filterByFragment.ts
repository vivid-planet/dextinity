import { type FragmentDefinitionNode, Kind, parse, type SelectionSetNode } from "graphql";

const parsedFragments = new Map<string, { root: FragmentDefinitionNode; fragmentsByName: Map<string, FragmentDefinitionNode> }>();

function parseFragment(fragment: string) {
    let parsed = parsedFragments.get(fragment);
    if (!parsed) {
        const fragmentDefinitions = parse(fragment).definitions.filter(
            (definition): definition is FragmentDefinitionNode => definition.kind === Kind.FRAGMENT_DEFINITION,
        );
        if (fragmentDefinitions.length === 0) {
            throw new Error("filterByFragment: the document contains no fragment definition");
        }
        parsed = {
            root: fragmentDefinitions[0],
            fragmentsByName: new Map(fragmentDefinitions.map((definition) => [definition.name.value, definition])),
        };
        parsedFragments.set(fragment, parsed);
    }
    return parsed;
}

function selectFields(
    selectionSet: SelectionSetNode,
    value: Record<string, unknown>,
    fragmentsByName: Map<string, FragmentDefinitionNode>,
    result: Record<string, unknown> = {},
): Record<string, unknown> {
    for (const selection of selectionSet.selections) {
        if (selection.kind === Kind.FIELD) {
            const key = selection.alias?.value ?? selection.name.value;
            if (!(key in value)) {
                continue;
            }
            result[key] = selectValue(selection.selectionSet, value[key], fragmentsByName, result[key]);
        } else if (selection.kind === Kind.INLINE_FRAGMENT) {
            // Type conditions aren't checked: the data was fetched with this fragment, so fields of non-matching types are absent anyway.
            selectFields(selection.selectionSet, value, fragmentsByName, result);
        } else {
            const fragment = fragmentsByName.get(selection.name.value);
            if (!fragment) {
                throw new Error(`filterByFragment: no fragment named ${selection.name.value}`);
            }
            selectFields(fragment.selectionSet, value, fragmentsByName, result);
        }
    }
    return result;
}

function selectValue(
    selectionSet: SelectionSetNode | undefined,
    value: unknown,
    fragmentsByName: Map<string, FragmentDefinitionNode>,
    previousResult: unknown,
): unknown {
    if (!selectionSet || value === null || typeof value !== "object") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item, index) =>
            selectValue(selectionSet, item, fragmentsByName, Array.isArray(previousResult) ? previousResult[index] : undefined),
        );
    }
    const target = previousResult !== null && typeof previousResult === "object" ? (previousResult as Record<string, unknown>) : {};
    return selectFields(selectionSet, value as Record<string, unknown>, fragmentsByName, target);
}

/**
 * Returns only the fields selected by `fragment`. Use it in a Server Component before passing GraphQL data to a
 * Client Component, so fields the component doesn't need aren't serialized into the RSC payload.
 */
export function filterByFragment<TFragmentData>(fragment: string, data: TFragmentData): TFragmentData {
    if (data === null || data === undefined) {
        return data;
    }
    const { root, fragmentsByName } = parseFragment(fragment);
    return selectValue(root.selectionSet, data, fragmentsByName, undefined) as TFragmentData;
}
