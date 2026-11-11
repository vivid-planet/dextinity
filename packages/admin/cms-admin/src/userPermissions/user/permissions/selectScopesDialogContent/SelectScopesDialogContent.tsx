import { gql, useQuery } from "@apollo/client";
import { type CheckboxGroupOption, EmptyState, Icon, TextField } from "@dextinity/ui";
import { CheckboxGroupField, InputField, SegmentedControlField, SelectField } from "@dextinity/ui-react-final-form";
import { useEffect, useRef, useState } from "react";
import { useForm, useFormState } from "react-final-form";
import { useIntl } from "react-intl";

import type { ContentScope } from "../../../../contentScope/Provider";
import {
    type ContentScopeOption,
    enumerableScopeCombinationExists,
    getContentScopeKey,
    getContentScopeOptions,
    getDimensionOptions,
    getEnumerableDimensionNames,
    getEnumerableSelectionAfterChange,
    getRequiredEnumerableDimensions,
    toContentScope,
} from "./contentScopeSelection";
import type { GQLAvailableContentScopesQuery } from "./SelectScopesDialogContent.generated";
import { ModeContent } from "./SelectScopesDialogContent.sc";

export function useAvailableContentScopesQuery() {
    return useQuery<GQLAvailableContentScopesQuery>(gql`
        query AvailableContentScopes {
            availableContentScopes: userPermissionsAvailableContentScopes {
                scope
                label
            }
            availableContentScopeDimensions: userPermissionsAvailableContentScopeDimensions {
                name
                label
            }
        }
    `);
}

export type SelectScopesMode = "available" | "custom";

export interface SelectScopesFormValues {
    mode: SelectScopesMode;
    /** The keys (see `getContentScopeKey`) of the checked available scopes, including the ones assigned already. */
    scopeKeys: string[];
    /** The scope built dimension by dimension in the custom mode. */
    scope: ContentScope;
}

/** The scopes to add: the newly checked available scopes, or the custom scope. */
export function getScopesToAdd({
    values,
    availableContentScopes,
    assignedScopeKeys,
}: {
    values: SelectScopesFormValues;
    availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"];
    assignedScopeKeys: ReadonlySet<string>;
}): ContentScope[] {
    if (values.mode === "custom") {
        return [
            Object.fromEntries(
                Object.entries(values.scope ?? {})
                    .filter(([, value]) => value != null && String(value).trim() !== "")
                    .map(([dimension, value]) => [dimension, String(value).trim()]),
            ),
        ];
    }
    const checkedKeys = new Set(values.scopeKeys);
    return availableContentScopes
        .filter((availableContentScope) => {
            const key = getContentScopeKey(availableContentScope.scope);
            return checkedKeys.has(key) && !assignedScopeKeys.has(key);
        })
        .map(toContentScope);
}

/** Validates the form; the messages are already translated. */
export function validateSelectScopes({
    values,
    data,
    assignedScopeKeys,
    messages,
}: {
    values: SelectScopesFormValues;
    data: GQLAvailableContentScopesQuery;
    assignedScopeKeys: ReadonlySet<string>;
    messages: { selectScope: string; selectValue: string; enterValue: string; combinationDoesNotExist: string };
}) {
    if (values.mode === "available") {
        const hasNewScope = getScopesToAdd({ values, availableContentScopes: data.availableContentScopes, assignedScopeKeys }).length > 0;
        return hasNewScope ? {} : { scopeKeys: messages.selectScope };
    }
    const scope = values.scope ?? {};
    const enumerableDimensionNames = getEnumerableDimensionNames(data.availableContentScopes);
    const scopeErrors: Record<string, string> = {};
    for (const dimension of getRequiredEnumerableDimensions(data.availableContentScopes)) {
        if (!scope[dimension]) {
            scopeErrors[dimension] = messages.selectValue;
        }
    }
    // Free-text dimensions must not be left empty: an empty value would drop the dimension from the scope, which grants access only to
    // scopes without that dimension rather than to all values. Require an explicit value (`*` for all).
    for (const dimension of data.availableContentScopeDimensions) {
        if (!enumerableDimensionNames.includes(dimension.name) && String(scope[dimension.name] ?? "").trim() === "") {
            scopeErrors[dimension.name] = messages.enterValue;
        }
    }
    // Only a combination of enumerable values that exists in the available content scopes can be assigned.
    if (
        Object.keys(scopeErrors).length === 0 &&
        enumerableDimensionNames.length > 0 &&
        !enumerableScopeCombinationExists({ scope, availableContentScopes: data.availableContentScopes })
    ) {
        for (const dimension of enumerableDimensionNames) {
            scopeErrors[dimension] = messages.combinationDoesNotExist;
        }
    }
    return Object.keys(scopeErrors).length > 0 ? { scope: scopeErrors } : {};
}

interface SelectScopesDialogContentProps {
    data: GQLAvailableContentScopesQuery;
    assignedScopeKeys: ReadonlySet<string>;
}

/**
 * The fields of a React Final Form with `SelectScopesFormValues`: the available scopes as a searchable tree of checkboxes, or – for
 * all values of a dimension (`*`) or dimensions that can't be listed – a custom scope built dimension by dimension.
 */
export function SelectScopesDialogContent({ data, assignedScopeKeys }: SelectScopesDialogContentProps) {
    const intl = useIntl();
    const { values } = useFormState<SelectScopesFormValues>({ subscription: { values: true } });

    return (
        <>
            <SegmentedControlField<SelectScopesMode>
                name="mode"
                aria-label={intl.formatMessage({ id: "dextinity.userPermissions.addScope.mode", defaultMessage: "How to choose the scopes" })}
                options={[
                    {
                        value: "available",
                        label: intl.formatMessage({ id: "dextinity.userPermissions.addScope.available", defaultMessage: "Available scopes" }),
                    },
                    {
                        value: "custom",
                        label: intl.formatMessage({ id: "dextinity.userPermissions.addScope.custom", defaultMessage: "Custom scope" }),
                    },
                ]}
            />
            {values.mode === "custom" ? (
                <CustomScopeSelection data={data} />
            ) : (
                <AvailableScopeSelection data={data} assignedScopeKeys={assignedScopeKeys} />
            )}
        </>
    );
}

function markAssignedScopes(options: ContentScopeOption[], assignedScopeKeys: ReadonlySet<string>, assignedLabel: string): CheckboxGroupOption[] {
    return options.map((option) =>
        option.children
            ? { ...option, children: markAssignedScopes(option.children, assignedScopeKeys, assignedLabel) }
            : assignedScopeKeys.has(option.value)
              ? { ...option, disabled: true, description: assignedLabel }
              : option,
    );
}

function AvailableScopeSelection({ data, assignedScopeKeys }: SelectScopesDialogContentProps) {
    const intl = useIntl();
    const [search, setSearch] = useState("");
    const options = markAssignedScopes(
        getContentScopeOptions({
            availableContentScopes: data.availableContentScopes,
            dimensionNames: data.availableContentScopeDimensions.map((dimension) => dimension.name),
            search,
        }),
        assignedScopeKeys,
        intl.formatMessage({ id: "dextinity.userPermissions.addScope.assigned", defaultMessage: "Has access already" }),
    );
    const label = intl.formatMessage({ id: "dextinity.userPermissions.addScope.scopes", defaultMessage: "Scopes" });

    return (
        <ModeContent>
            <TextField
                name="scopeSearch"
                type="search"
                label={intl.formatMessage({ id: "dextinity.userPermissions.addScope.search", defaultMessage: "Search scopes" })}
                prefix={<Icon name="search" />}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />
            {options.length > 0 ? (
                <CheckboxGroupField name="scopeKeys" label={label} options={options} />
            ) : (
                <EmptyState
                    icon={<Icon name="search" />}
                    title={intl.formatMessage({ id: "dextinity.userPermissions.noScopeMatches", defaultMessage: "No scopes match the search" })}
                />
            )}
        </ModeContent>
    );
}

function CustomScopeSelection({ data }: { data: GQLAvailableContentScopesQuery }) {
    const intl = useIntl();
    const { values } = useFormState<SelectScopesFormValues>({ subscription: { values: true } });
    const scope = values.scope ?? {};
    const enumerableDimensionNames = getEnumerableDimensionNames(data.availableContentScopes);
    const requiredEnumerableDimensions = getRequiredEnumerableDimensions(data.availableContentScopes);
    const allValuesLabel = intl.formatMessage({ id: "dextinity.userPermissions.allContentScopeValues", defaultMessage: "All" });

    return (
        <ModeContent>
            <EnumerableSelectionKeeper availableContentScopes={data.availableContentScopes} />
            {data.availableContentScopeDimensions.map((dimension) =>
                enumerableDimensionNames.includes(dimension.name) ? (
                    <SelectField
                        key={dimension.name}
                        name={`scope.${dimension.name}`}
                        label={dimension.label}
                        required={requiredEnumerableDimensions.includes(dimension.name)}
                        options={getDimensionOptions({
                            dimension: dimension.name,
                            scope,
                            availableContentScopes: data.availableContentScopes,
                            allValuesLabel,
                        })}
                    />
                ) : (
                    <InputField
                        key={dimension.name}
                        name={`scope.${dimension.name}`}
                        label={dimension.label}
                        helperText={intl.formatMessage({ id: "dextinity.userPermissions.allValuesHint", defaultMessage: "* for All" })}
                        required
                    />
                ),
            )}
        </ModeContent>
    );
}

// Changing a dimension keeps the other enumerable selections only while they still form a valid combination with the new value; the
// free-text selections are preserved.
function EnumerableSelectionKeeper({ availableContentScopes }: { availableContentScopes: GQLAvailableContentScopesQuery["availableContentScopes"] }) {
    const form = useForm<SelectScopesFormValues>();
    const { values } = useFormState<SelectScopesFormValues>({ subscription: { values: true } });
    const scope = values.scope;
    const previousScope = useRef(scope);

    useEffect(() => {
        const previous = previousScope.current ?? {};
        previousScope.current = scope;
        if (!scope) {
            return;
        }
        const enumerableDimensionNames = getEnumerableDimensionNames(availableContentScopes);
        const changedDimension = enumerableDimensionNames.find((dimension) => scope[dimension] !== previous[dimension]);
        if (changedDimension === undefined || !scope[changedDimension]) {
            return;
        }
        const enumerableSelection = getEnumerableSelectionAfterChange({
            availableContentScopes,
            scope,
            dimension: changedDimension,
            value: scope[changedDimension],
        });
        const removedDimensions = enumerableDimensionNames.filter((dimension) => scope[dimension] && !enumerableSelection[dimension]);
        for (const dimension of removedDimensions) {
            form.change(`scope.${dimension}` as keyof SelectScopesFormValues, undefined);
        }
    }, [scope, availableContentScopes, form]);

    return null;
}
