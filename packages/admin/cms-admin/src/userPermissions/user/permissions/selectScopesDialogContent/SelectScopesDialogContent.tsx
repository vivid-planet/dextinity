import { gql, useQuery } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, FinalFormSelect, Loading } from "@dextinity/admin";
import type { FormApi } from "final-form";
import { type FunctionComponent, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import type { ContentScope } from "../ContentScopeDataGrid";
import {
    enumerableScopeCombinationExists,
    getDimensionOptions,
    getEnumerableDimensionNames,
    getEnumerableSelectionAfterChange,
    getRequiredEnumerableDimensions,
} from "./contentScopeSelection";
import type { GQLAvailableContentScopesQuery } from "./SelectScopesDialogContent.generated";

interface SelectScopesDialogContentProps {
    /** Called with the built scope when the form is submitted. The caller is responsible for persisting it. */
    onSubmit: (scope: ContentScope) => Promise<void> | void;
}

type FormValues = {
    scope: ContentScope;
};

export const SelectScopesDialogContent: FunctionComponent<SelectScopesDialogContentProps> = ({ onSubmit }) => {
    const intl = useIntl();

    // Memoized so that re-renders don't reinitialize the form and discard the selection.
    const initialValues = useMemo<FormValues>(() => ({ scope: {} }), []);

    const { data, error } = useQuery<GQLAvailableContentScopesQuery>(gql`
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

    const submit = async (values: FormValues) => {
        const scope: ContentScope = Object.fromEntries(
            Object.entries(values.scope)
                .filter(([, value]) => value != null && String(value).trim() !== "")
                .map(([dimension, value]) => [dimension, String(value).trim()]),
        );
        await onSubmit(scope);
    };

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        return <Loading />;
    }

    // A dimension is enumerable when it appears in the available content scopes; its values then come from there. The remaining
    // declared dimensions (e.g. one with too many values to enumerate) are entered as free text.
    const enumerableDimensionNames = getEnumerableDimensionNames(data.availableContentScopes);
    const isEnumerableDimension = (dimension: string) => enumerableDimensionNames.includes(dimension);
    const requiredEnumerableDimensions = getRequiredEnumerableDimensions(data.availableContentScopes);

    const allValuesLabel = intl.formatMessage({ id: "dextinity.userPermissions.allContentScopeValues", defaultMessage: "All" });

    // Changing a dimension keeps the other enumerable selections only while they still form a valid combination; the free-text
    // selections are preserved.
    const changeEnumerableValue = (form: FormApi<FormValues>, scope: ContentScope, dimension: string, value: string) => {
        const enumerableSelection = getEnumerableSelectionAfterChange({
            availableContentScopes: data.availableContentScopes,
            scope,
            dimension,
            value,
        });
        const freeSelection = Object.fromEntries(
            data.availableContentScopeDimensions
                .filter((declaredDimension) => !isEnumerableDimension(declaredDimension.name) && scope[declaredDimension.name])
                .map((declaredDimension) => [declaredDimension.name, scope[declaredDimension.name]]),
        );
        form.change("scope", { ...freeSelection, ...enumerableSelection });
    };

    const validate = ({ scope = {} }: FormValues) => {
        const scopeErrors: Record<string, string> = {};
        for (const dimension of requiredEnumerableDimensions) {
            if (!scope[dimension]) {
                scopeErrors[dimension] = intl.formatMessage({ id: "dextinity.userPermissions.selectValue", defaultMessage: "Select a value." });
            }
        }
        // Free-text dimensions must not be left empty: an empty value would drop the dimension from the scope, which grants
        // access only to scopes without that dimension rather than to all values. Require an explicit value (`*` for all).
        for (const dimension of data.availableContentScopeDimensions) {
            if (!isEnumerableDimension(dimension.name) && String(scope[dimension.name] ?? "").trim() === "") {
                scopeErrors[dimension.name] = intl.formatMessage({
                    id: "dextinity.userPermissions.enterValue",
                    defaultMessage: "Enter a value (* for all).",
                });
            }
        }
        // Only a combination of enumerable values that exists in the available content scopes can be assigned. Skip this
        // when there are no enumerable dimensions (all dimensions are free text), as there is no combination to match.
        if (Object.keys(scopeErrors).length === 0 && enumerableDimensionNames.length > 0) {
            if (!enumerableScopeCombinationExists({ scope, availableContentScopes: data.availableContentScopes })) {
                const message = intl.formatMessage({
                    id: "dextinity.userPermissions.contentScopeDoesNotExist",
                    defaultMessage: "This combination of scopes does not exist.",
                });
                for (const dimension of enumerableDimensionNames) {
                    scopeErrors[dimension] = message;
                }
            }
        }
        return Object.keys(scopeErrors).length > 0 ? { scope: scopeErrors } : {};
    };

    return (
        <FinalForm<FormValues>
            subscription={{ values: true }}
            mode="edit"
            onSubmit={submit}
            onAfterSubmit={() => null}
            initialValues={initialValues}
            validate={validate}
        >
            {({ values, form }: { values: FormValues; form: FormApi<FormValues> }) => {
                const scope = values.scope ?? {};
                return (
                    <>
                        {data.availableContentScopeDimensions.map((dimension) => {
                            if (isEnumerableDimension(dimension.name)) {
                                const options = getDimensionOptions({
                                    dimension: dimension.name,
                                    scope,
                                    availableContentScopes: data.availableContentScopes,
                                    allValuesLabel,
                                });
                                return (
                                    <Field<string>
                                        key={dimension.name}
                                        name={`scope.${dimension.name}`}
                                        label={dimension.label}
                                        fullWidth
                                        required={requiredEnumerableDimensions.includes(dimension.name)}
                                    >
                                        {({ input, meta }) => (
                                            <FinalFormSelect
                                                input={{
                                                    ...input,
                                                    onChange: (value: string) => changeEnumerableValue(form, scope, dimension.name, value),
                                                }}
                                                meta={meta}
                                                fullWidth
                                                options={options.map((option) => option.value)}
                                                getOptionLabel={(value: string) => options.find((option) => option.value === value)?.label ?? value}
                                            />
                                        )}
                                    </Field>
                                );
                            }
                            return (
                                <Field
                                    key={dimension.name}
                                    name={`scope.${dimension.name}`}
                                    label={dimension.label}
                                    helperText={<FormattedMessage id="dextinity.userPermissions.allValuesHint" defaultMessage="* for All" />}
                                    fullWidth
                                    required
                                    component={FinalFormInput}
                                />
                            );
                        })}
                    </>
                );
            }}
        </FinalForm>
    );
};
