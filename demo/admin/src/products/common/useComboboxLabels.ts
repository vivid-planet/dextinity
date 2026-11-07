import type { ComboboxLabels } from "@dextinity/ui";
import { useMemo } from "react";
import { useIntl } from "react-intl";

export function useComboboxLabels(): ComboboxLabels {
    const intl = useIntl();
    return useMemo(
        () => ({
            loading: intl.formatMessage({ id: "uiDemo.productsCommon.combobox.loading", defaultMessage: "Loading…" }),
            noResults: intl.formatMessage({ id: "uiDemo.productsCommon.combobox.noResults", defaultMessage: "No results" }),
            error: intl.formatMessage({ id: "uiDemo.productsCommon.combobox.error", defaultMessage: "The options couldn't be loaded." }),
            retry: intl.formatMessage({ id: "uiDemo.productsCommon.combobox.retry", defaultMessage: "Retry" }),
            create: (query) => intl.formatMessage({ id: "uiDemo.productsCommon.combobox.create", defaultMessage: "Create “{query}”" }, { query }),
            remove: (optionLabel) =>
                intl.formatMessage({ id: "uiDemo.productsCommon.combobox.remove", defaultMessage: "Remove {optionLabel}" }, { optionLabel }),
            clear: intl.formatMessage({ id: "uiDemo.productsCommon.combobox.clear", defaultMessage: "Clear" }),
        }),
        [intl],
    );
}
