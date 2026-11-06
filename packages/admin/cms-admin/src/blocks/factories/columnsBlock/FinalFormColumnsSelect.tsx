import type { FieldRenderProps } from "react-final-form";

import { ColumnsSelect } from "./ColumnsSelect";

interface Props extends FieldRenderProps<number> {
    columns: number[];
}

export function FinalFormColumnsSelect({ input: { value, onChange }, columns }: Props) {
    return <ColumnsSelect columns={columns} value={value} onChange={onChange} />;
}
