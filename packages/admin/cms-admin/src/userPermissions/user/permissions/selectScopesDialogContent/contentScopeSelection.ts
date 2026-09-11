import { contentScopeAllValues, type ContentScope } from "../contentScope";

export interface AvailableContentScope {
    // Values are raw JSON (e.g. numbers or booleans), unlike a selection whose values are always strings.
    scope: Record<string, unknown>;
    label?: Record<string, string> | null;
}

export interface ContentScopeOption {
    value: string;
    label: string;
}

// A dimension is enumerable when it appears in the available content scopes; its values then come from there.
export function getEnumerableDimensionNames(availableContentScopes: AvailableContentScope[]): string[] {
    return Array.from(new Set(availableContentScopes.flatMap((availableContentScope) => Object.keys(availableContentScope.scope))));
}

// Only dimensions present in every available content scope are mandatory. When the available content scopes are heterogeneous
// (a dimension exists in some but not others), leaving that dimension empty selects the scopes without it, so it stays optional.
export function getRequiredEnumerableDimensions(availableContentScopes: AvailableContentScope[]): string[] {
    return getEnumerableDimensionNames(availableContentScopes).filter((dimension) =>
        availableContentScopes.every((availableContentScope) => availableContentScope.scope[dimension] != null),
    );
}

// Available scope values are raw JSON (e.g. numbers), while selections are strings, so compare per dimension as strings.
// A wildcard selection (`*`) matches any value the dimension has in the available content scope.
export function availableContentScopeMatchesSelection(availableContentScope: Record<string, unknown>, selection: ContentScope): boolean {
    return Object.entries(selection).every(([dimension, value]) =>
        value === contentScopeAllValues ? availableContentScope[dimension] != null : String(availableContentScope[dimension]) === String(value),
    );
}

// The selectable values of a dimension depend on the values already selected for the other enumerable dimensions, so that only
// combinations that exist in the available content scopes can be built. A wildcard ("All") option is offered whenever the
// dimension has selectable values for the current selection, so a scope can grant every value of the dimension.
export function getDimensionOptions({
    dimension,
    scope,
    availableContentScopes,
    allValuesLabel,
}: {
    dimension: string;
    scope: ContentScope;
    availableContentScopes: AvailableContentScope[];
    allValuesLabel: string;
}): ContentScopeOption[] {
    const otherSelection: ContentScope = Object.fromEntries(
        getEnumerableDimensionNames(availableContentScopes)
            .filter((otherDimension) => otherDimension !== dimension && scope[otherDimension])
            .map((otherDimension) => [otherDimension, scope[otherDimension]]),
    );
    const options: ContentScopeOption[] = [];
    for (const availableContentScope of availableContentScopes) {
        if (!availableContentScopeMatchesSelection(availableContentScope.scope, otherSelection)) {
            continue;
        }
        const value = availableContentScope.scope[dimension];
        if (value != null && !options.some((option) => option.value === String(value))) {
            options.push({ value: String(value), label: availableContentScope.label?.[dimension] ?? String(value) });
        }
    }
    if (options.length > 0) {
        options.unshift({ value: contentScopeAllValues, label: allValuesLabel });
    }
    return options;
}

// Changing a dimension keeps the other enumerable selections only while they still form a valid combination with the newly
// chosen value; the rest is dropped.
export function getEnumerableSelectionAfterChange({
    availableContentScopes,
    scope,
    dimension,
    value,
}: {
    availableContentScopes: AvailableContentScope[];
    scope: ContentScope;
    dimension: string;
    value: string;
}): ContentScope {
    const enumerableSelection: ContentScope = { [dimension]: value };
    for (const otherDimension of getEnumerableDimensionNames(availableContentScopes)) {
        if (otherDimension === dimension || !scope[otherDimension]) {
            continue;
        }
        const candidate = { ...enumerableSelection, [otherDimension]: scope[otherDimension] };
        if (availableContentScopes.some((availableContentScope) => availableContentScopeMatchesSelection(availableContentScope.scope, candidate))) {
            enumerableSelection[otherDimension] = scope[otherDimension];
        }
    }
    return enumerableSelection;
}

// Whether the selected combination of enumerable values exists in the available content scopes. A wildcard (`*`) matches any
// value of its dimension; an omitted dimension matches only the scopes that also lack it.
export function enumerableScopeCombinationExists({
    scope,
    availableContentScopes,
}: {
    scope: ContentScope;
    availableContentScopes: AvailableContentScope[];
}): boolean {
    const enumerableDimensionNames = getEnumerableDimensionNames(availableContentScopes);
    return availableContentScopes.some((availableContentScope) =>
        enumerableDimensionNames.every((dimension) =>
            scope[dimension] === contentScopeAllValues
                ? availableContentScope.scope[dimension] != null
                : String(availableContentScope.scope[dimension]) === String(scope[dimension]),
        ),
    );
}
