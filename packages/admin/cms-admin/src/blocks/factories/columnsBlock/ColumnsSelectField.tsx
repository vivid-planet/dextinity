import { styled } from "@mui/material/styles";
import { type ReactNode, useId } from "react";
import { useField } from "react-final-form";

import { ColumnsSelect } from "./ColumnsSelect";

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
    const labelId = useId();
    const { input } = useField<number>(name);

    return (
        <Root>
            <Label id={labelId}>{label}</Label>
            <ColumnsSelect columns={columns} value={input.value} onChange={input.onChange} aria-labelledby={labelId} />
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
