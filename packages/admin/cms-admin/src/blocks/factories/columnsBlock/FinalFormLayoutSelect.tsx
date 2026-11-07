import type { ReactNode } from "react";
import type { FieldRenderProps } from "react-final-form";
import { FormattedMessage } from "react-intl";

import type { ColumnsBlockLayout } from "../createColumnsBlock";
import { LayoutSelect } from "./LayoutSelect";

interface Props extends FieldRenderProps<ColumnsBlockLayout> {
    layouts: ColumnsBlockLayout[];
    /**
     * The label of the select.
     *
     * @defaultValue "Layout"
     */
    selectLabel?: ReactNode;
}

/**
 * @deprecated Use `LayoutSelectField`, which brings its own label, instead of passing this component to a `Field`.
 */
export function FinalFormLayoutSelect({ input: { name, value, onChange, onBlur, onFocus }, layouts, selectLabel }: Props) {
    return (
        <LayoutSelect
            name={name}
            label={selectLabel ?? <FormattedMessage id="dextinity.blocks.columns.layout" defaultMessage="Layout" />}
            layouts={layouts}
            value={value || null}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
        />
    );
}
