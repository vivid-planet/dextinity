import type { SegmentedControlOption } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { ColumnsIcon } from "./ColumnsIcon";

export function useColumnsSelectOptions(columns: number[]): SegmentedControlOption<string>[] {
    const intl = useIntl();

    return columns.map((column) => ({
        value: String(column),
        icon: <ColumnsIcon columns={column} />,
        "aria-label": intl.formatMessage(
            { id: "dextinity.blocks.columns.columnCount", defaultMessage: "{count, plural, one {# column} other {# columns}}" },
            { count: column },
        ),
    }));
}
