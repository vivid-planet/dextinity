import type { ComboboxLabels } from "@dextinity/ui";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export function useComboboxLabels(): ComboboxLabels {
    const intl = useIntl();
    return useMemo(
        () => ({
            loading: intl.formatMessage({ id: "combobox.loading", defaultMessage: "Loading…" }),
            noResults: intl.formatMessage({ id: "combobox.noResults", defaultMessage: "No results" }),
            error: intl.formatMessage({ id: "combobox.error", defaultMessage: "The options couldn't be loaded." }),
            retry: intl.formatMessage({ id: "combobox.retry", defaultMessage: "Retry" }),
            create: (query) => intl.formatMessage({ id: "combobox.create", defaultMessage: "Create “{query}”" }, { query }),
            remove: (optionLabel) => intl.formatMessage({ id: "combobox.remove", defaultMessage: "Remove {optionLabel}" }, { optionLabel }),
            clear: intl.formatMessage({ id: "combobox.clear", defaultMessage: "Clear" }),
            showOptions: intl.formatMessage({ id: "combobox.showOptions", defaultMessage: "Show options" }),
        }),
        [intl],
    );
}
