import { SegmentedControl } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { ColumnsIcon } from "./ColumnsIcon";

interface ColumnsSelectProps {
    columns: number[];
    value: number;
    onChange: (columns: number) => void;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}

export function ColumnsSelect({ columns, value, onChange, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy }: ColumnsSelectProps) {
    const intl = useIntl();

    return (
        <SegmentedControl<string>
            aria-label={ariaLabel ?? intl.formatMessage({ id: "dextinity.blocks.columns.columns", defaultMessage: "Columns" })}
            aria-labelledby={ariaLabelledBy}
            options={columns.map((column) => ({
                value: String(column),
                icon: <ColumnsIcon columns={column} />,
                "aria-label": intl.formatMessage(
                    { id: "dextinity.blocks.columns.columnCount", defaultMessage: "{count, plural, one {# column} other {# columns}}" },
                    { count: column },
                ),
            }))}
            value={String(value)}
            onChange={(column) => onChange(Number(column))}
        />
    );
}
