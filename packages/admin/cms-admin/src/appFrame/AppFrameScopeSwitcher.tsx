import { ScopeSwitcher, type ScopeSwitcherDimension } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";

import { type ContentScope, useContentScope } from "../contentScope/Provider";

export type AppFrameScopeDimensionLabels = Partial<Record<keyof ContentScope, string>>;

function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

interface AppFrameScopeSwitcherProps {
    dimensionLabels?: AppFrameScopeDimensionLabels;
}

export function AppFrameScopeSwitcher({ dimensionLabels }: AppFrameScopeSwitcherProps) {
    const intl = useIntl();
    const { scope, setScope, values, supported } = useContentScope();
    const [open, setOpen] = useState(false);

    if (!supported || values.length <= 1) {
        return null;
    }

    const keys = Object.keys(values[0].scope) as Array<keyof ContentScope>;
    const dimensions: ScopeSwitcherDimension[] = keys.map((key) => {
        const options = new Map<string, string>();
        for (const value of values) {
            const optionValue = String(value.scope[key]);
            if (!options.has(optionValue)) {
                options.set(optionValue, value.label?.[key] ?? optionValue);
            }
        }
        return {
            key: String(key),
            label: dimensionLabels?.[key] ?? capitalize(String(key)),
            options: Array.from(options, ([value, label]) => ({ value, label })),
        };
    });
    const currentValue = keys.map((key) => String(scope[key]));

    function changeScope(nextValue: string[]) {
        const matchesValue = (candidate: ContentScope, indexes: number[]) =>
            indexes.every((index) => String(candidate[keys[index]]) === nextValue[index]);
        const allIndexes = keys.map((_, index) => index);
        const changedIndexes = allIndexes.filter((index) => nextValue[index] !== currentValue[index]);
        // Not every combination of the dimensions exists: keep the changed dimension and take the first allowed scope with it
        const nextScope =
            values.find((candidate) => matchesValue(candidate.scope, allIndexes)) ??
            values.find((candidate) => matchesValue(candidate.scope, changedIndexes));
        if (nextScope) {
            setScope(() => nextScope.scope);
        }
    }

    return (
        <ScopeSwitcher
            dimensions={dimensions}
            value={currentValue}
            onChange={changeScope}
            open={open}
            onOpenChange={setOpen}
            searchable={values.length > 6}
            labels={{
                trigger: intl.formatMessage({ id: "dextinity.appFrame.scopeSwitcher.trigger", defaultMessage: "Change scope" }),
                search: intl.formatMessage({ id: "dextinity.appFrame.scopeSwitcher.search", defaultMessage: "Search scopes" }),
                searchPlaceholder: intl.formatMessage({
                    id: "dextinity.appFrame.scopeSwitcher.searchPlaceholder",
                    defaultMessage: "Search scopes …",
                }),
                recent: intl.formatMessage({ id: "dextinity.appFrame.scopeSwitcher.recent", defaultMessage: "Recent" }),
                noResults: intl.formatMessage({ id: "dextinity.appFrame.scopeSwitcher.noResults", defaultMessage: "No matching scope" }),
            }}
        />
    );
}
