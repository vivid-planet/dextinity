import { SegmentedControlField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { type ReactNode, useId } from "react";
import { useIntl } from "react-intl";

import { messageText } from "../../form/messageText";
import { useColumnsSelectOptions } from "./useColumnsSelectOptions";

export interface ColumnsSelectFieldProps {
    /** The field's path in the form values. The field holds the number of columns. */
    name: string;
    label: ReactNode;
    /** The numbers of columns to choose from, each shown as an icon. */
    columns: number[];
}

/**
 * Chooses the number of columns of a columns block in a React Final Form form.
 */
export function ColumnsSelectField({ name, label, columns }: ColumnsSelectFieldProps) {
    const intl = useIntl();
    const labelId = useId();
    const options = useColumnsSelectOptions(columns);

    return (
        <Root>
            <Label id={labelId}>{label}</Label>
            <SegmentedControlField<string, number>
                name={name}
                aria-label={messageText(intl, label) ?? intl.formatMessage({ id: "dextinity.blocks.columns.columns", defaultMessage: "Columns" })}
                aria-labelledby={labelId}
                options={options}
                format={(value) => (value === undefined ? "" : String(value))}
                parse={(value) => Number(value)}
            />
        </Root>
    );
}

const Root = styled("div")`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--dextinity-field-gap);
`;

const Label = styled("span")`
    color: var(--dextinity-field-label-color);
    font-size: var(--dextinity-field-label-font-size);
    font-weight: var(--dextinity-field-label-font-weight);
    line-height: 1.3;
`;
