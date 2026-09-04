import { gql, useQuery } from "@apollo/client";
import { Field, FinalForm, FinalFormInput, FinalFormSelect, Loading } from "@dextinity/admin";
import type { FormApi } from "final-form";
import isEqual from "lodash.isequal";
import { type FunctionComponent, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import type { ContentScope } from "../ContentScopeDataGrid";
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
    const enumerableDimensionNames = Array.from(new Set(data.availableContentScopes.flatMap((contentScope) => Object.keys(contentScope.scope))));
    const isEnumerableDimension = (dimension: string) => enumerableDimensionNames.includes(dimension);

    const availableContentScopeMatchesSelection = (availableContentScope: ContentScope, selection: ContentScope) =>
        Object.entries(selection).every(([dimension, value]) => availableContentScope[dimension] === value);

    // The selectable values of a dimension depend on the values already selected for the other enumerable dimensions, so that
    // only combinations that exist in the available content scopes can be built.
    const optionsForDimension = (dimension: string, scope: ContentScope): Array<{ value: string; label: string }> => {
        const otherSelection = Object.fromEntries(
            enumerableDimensionNames
                .filter((otherDimension) => otherDimension !== dimension && scope[otherDimension])
                .map((otherDimension) => [otherDimension, scope[otherDimension]]),
        );
        const options: Array<{ value: string; label: string }> = [];
        for (const availableContentScope of data.availableContentScopes) {
            if (!availableContentScopeMatchesSelection(availableContentScope.scope, otherSelection)) {
                continue;
            }
            const value = availableContentScope.scope[dimension];
            if (value != null && !options.some((option) => option.value === String(value))) {
                options.push({ value: String(value), label: availableContentScope.label?.[dimension] ?? String(value) });
            }
        }
        return options;
    };

    // Changing a dimension keeps the other selections only while they still form a valid combination; the rest is cleared.
    const changeEnumerableValue = (form: FormApi<FormValues>, scope: ContentScope, dimension: string, value: string) => {
        const enumerableSelection: ContentScope = { [dimension]: value };
        for (const otherDimension of enumerableDimensionNames) {
            if (otherDimension === dimension || !scope[otherDimension]) {
                continue;
            }
            const candidate = { ...enumerableSelection, [otherDimension]: scope[otherDimension] };
            if (
                data.availableContentScopes.some((availableContentScope) =>
                    availableContentScopeMatchesSelection(availableContentScope.scope, candidate),
                )
            ) {
                enumerableSelection[otherDimension] = scope[otherDimension];
            }
        }
        const freeSelection = Object.fromEntries(
            data.availableContentScopeDimensions
                .filter((declaredDimension) => !isEnumerableDimension(declaredDimension.name) && scope[declaredDimension.name])
                .map((declaredDimension) => [declaredDimension.name, scope[declaredDimension.name]]),
        );
        form.change("scope", { ...freeSelection, ...enumerableSelection });
    };

    const validate = ({ scope = {} }: FormValues) => {
        const scopeErrors: Record<string, string> = {};
        for (const dimension of enumerableDimensionNames) {
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
            const enumerablePartOfScope = Object.fromEntries(enumerableDimensionNames.map((dimension) => [dimension, scope[dimension]]));
            if (!data.availableContentScopes.some((availableContentScope) => isEqual(availableContentScope.scope, enumerablePartOfScope))) {
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
                                const options = optionsForDimension(dimension.name, scope);
                                return (
                                    <Field<string> key={dimension.name} name={`scope.${dimension.name}`} label={dimension.label} fullWidth required>
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
