import type { FilterBarLabels } from "@dextinity/ui";
import { useIntl } from "react-intl";

export function useFilterBarLabels({ search, searchPlaceholder }: { search: string; searchPlaceholder: string }): FilterBarLabels {
    const intl = useIntl();
    return {
        search,
        searchPlaceholder,
        filters: intl.formatMessage({ id: "uiDemo.productsCommon.filters", defaultMessage: "Filters" }),
        resultCount: (count) =>
            intl.formatMessage(
                { id: "uiDemo.productsCommon.resultCount", defaultMessage: "{count, plural, one {# result} other {# results}}" },
                { count },
            ),
    };
}
