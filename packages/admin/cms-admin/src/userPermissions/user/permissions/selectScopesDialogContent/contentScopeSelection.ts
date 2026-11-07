import type { ContentScope } from "../../../../contentScope/Provider";
import { contentScopeAllValues } from "../contentScope";

export interface AvailableContentScope {
    // Values are raw JSON (e.g. numbers or booleans), unlike a selection whose values are always strings.
    scope: Record<string, unknown>;
    label?: Record<string, string> | null;
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
}): Array<{ value: string; label: string }> {
    const otherSelection: ContentScope = Object.fromEntries(
        getEnumerableDimensionNames(availableContentScopes)
            .filter((otherDimension) => otherDimension !== dimension && scope[otherDimension])
            .map((otherDimension) => [otherDimension, scope[otherDimension]]),
    );
    const options: Array<{ value: string; label: string }> = [];
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

// Content scopes are flat objects of primitive values, so their sorted entries form a stable key, independent of the order of the
// dimensions and of whether a value is raw JSON (e.g. a number) or a string.
export function getContentScopeKey(scope: Record<string, unknown>): string {
    return JSON.stringify(
        Object.entries(scope)
            .map(([dimension, value]) => [dimension, String(value)])
            .sort(([a], [b]) => a.localeCompare(b)),
    );
}

export function toContentScope(availableContentScope: AvailableContentScope): ContentScope {
    return Object.fromEntries(Object.entries(availableContentScope.scope).map(([dimension, value]) => [dimension, String(value)]));
}

export interface ContentScopeOption {
    /** The scope's key (see `getContentScopeKey`) for a scope, or an id prefixed with `group:` for a group of scopes. */
    value: string;
    label: string;
    children?: ContentScopeOption[];
}

// Groups the available content scopes by their enumerable dimensions in the declared order, e.g. the languages below their domain. A
// scope that lacks the dimension of a level stays at that level.
export function getContentScopeOptions({
    availableContentScopes,
    dimensionNames,
    search = "",
}: {
    availableContentScopes: AvailableContentScope[];
    /** The declared dimensions, in their order. Enumerable dimensions that aren't declared follow them. */
    dimensionNames: string[];
    search?: string;
}): ContentScopeOption[] {
    const enumerableDimensionNames = getEnumerableDimensionNames(availableContentScopes);
    const levels = [
        ...dimensionNames.filter((dimension) => enumerableDimensionNames.includes(dimension)),
        ...enumerableDimensionNames.filter((dimension) => !dimensionNames.includes(dimension)),
    ];
    const getLabel = (availableContentScope: AvailableContentScope, dimension: string) =>
        availableContentScope.label?.[dimension] ?? String(availableContentScope.scope[dimension]);
    const normalizedSearch = search.trim().toLowerCase();
    const matchingScopes = normalizedSearch
        ? availableContentScopes.filter((availableContentScope) =>
              levels.some(
                  (dimension) =>
                      availableContentScope.scope[dimension] != null &&
                      getLabel(availableContentScope, dimension).toLowerCase().includes(normalizedSearch),
              ),
          )
        : availableContentScopes;

    const buildLevel = (scopes: AvailableContentScope[], depth: number, path: string[]): ContentScopeOption[] => {
        const dimension = levels[depth];
        const remainingDimensions = levels.slice(depth + 1);
        const options: ContentScopeOption[] = [];
        const groups = new Map<string, AvailableContentScope[]>();
        const groupValues = new Map<string, string>();
        for (const availableContentScope of scopes) {
            const value = availableContentScope.scope[dimension];
            const hasDeeperDimension = remainingDimensions.some((remaining) => availableContentScope.scope[remaining] != null);
            if (value == null || !hasDeeperDimension) {
                options.push({
                    value: getContentScopeKey(availableContentScope.scope),
                    label:
                        value == null
                            ? levels
                                  .filter((level) => availableContentScope.scope[level] != null)
                                  .map((level) => getLabel(availableContentScope, level))
                                  .join(" · ")
                            : getLabel(availableContentScope, dimension),
                });
                continue;
            }
            const groupScopes = groups.get(String(value));
            if (groupScopes) {
                groupScopes.push(availableContentScope);
            } else {
                const groupOptionValue = `group:${JSON.stringify([...path, String(value)])}`;
                groups.set(String(value), [availableContentScope]);
                groupValues.set(groupOptionValue, String(value));
                options.push({ value: groupOptionValue, label: getLabel(availableContentScope, dimension) });
            }
        }
        return options.map((option) => {
            const groupValue = groupValues.get(option.value);
            return groupValue === undefined
                ? option
                : { ...option, children: buildLevel(groups.get(groupValue) ?? [], depth + 1, [...path, groupValue]) };
        });
    };

    return levels.length > 0 ? buildLevel(matchingScopes, 0, []) : [];
}

// Whether an assigned scope grants access to the available scope: each of its values equals the available scope's value or is the
// wildcard (`*`), which also covers dimensions the available scope lacks.
export function isContentScopeCoveredBy({ availableScope, assignedScope }: { availableScope: Record<string, unknown>; assignedScope: ContentScope }) {
    return (
        Object.entries(assignedScope).every(
            ([dimension, value]) => value === contentScopeAllValues || String(availableScope[dimension]) === String(value),
        ) && Object.keys(availableScope).every((dimension) => assignedScope[dimension] !== undefined)
    );
}
