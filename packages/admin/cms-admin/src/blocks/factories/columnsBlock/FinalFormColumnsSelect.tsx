import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import type { FieldRenderProps } from "react-final-form";

import { ColumnsIcon } from "./ColumnsIcon";

interface Props extends FieldRenderProps<number> {
    columns: number[];
}

export function FinalFormColumnsSelect({ input: { value, onChange }, columns }: Props) {
    return (
        <ToggleButtonGroup
            value={value}
            onChange={(event, value: number | null) => {
                if (value !== null) {
                    onChange(value);
                }
            }}
            exclusive
        >
            {columns.map((c) => (
                <ToggleButton key={c} value={c}>
                    <ColumnsIcon columns={c} />
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
