import type { BulkActionBarLabels, DataGridLabels } from "@dextinity/ui";
import { useMemo } from "react";
import { useIntl } from "react-intl";

/**
 * Translated `labels` and `bulkActionLabels` for a `DataGrid` of `@dextinity/ui`.
 */
export function useDataGridLabels(): { labels: DataGridLabels; bulkActionLabels: BulkActionBarLabels } {
    const intl = useIntl();
    return useMemo(
        () => ({
            labels: {
                selectAll: intl.formatMessage({ id: "dextinity.dataGrid.selectAll", defaultMessage: "Select all" }),
                selectRow: intl.formatMessage({ id: "dextinity.dataGrid.selectRow", defaultMessage: "Select" }),
                actions: intl.formatMessage({ id: "dextinity.dataGrid.actions", defaultMessage: "Actions" }),
                moveRow: intl.formatMessage({ id: "dextinity.dataGrid.moveRow", defaultMessage: "Move" }),
                expandRow: intl.formatMessage({ id: "dextinity.dataGrid.expandRow", defaultMessage: "Expand" }),
                columns: intl.formatMessage({ id: "dextinity.dataGrid.columns", defaultMessage: "Columns" }),
            },
            bulkActionLabels: {
                count: (count) => intl.formatMessage({ id: "dextinity.dataGrid.bulk.count", defaultMessage: "{count} selected" }, { count }),
                clear: intl.formatMessage({ id: "dextinity.dataGrid.bulk.clear", defaultMessage: "Clear selection" }),
                toolbar: intl.formatMessage({ id: "dextinity.dataGrid.bulk.toolbar", defaultMessage: "Bulk actions" }),
            },
        }),
        [intl],
    );
}
