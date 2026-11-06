import { Icon } from "@dextinity/ui";
import { PickerField, type PickerFieldProps } from "@dextinity/ui-react-final-form";
import { useIntl } from "react-intl";

import { renderPageTreeSelectValue } from "./PageTreeSelect";
import { PageTreeSelectDialog, type PageTreeSelectValue } from "./PageTreeSelectDialog";

export type PageTreeSelectFieldProps<FieldValue = PageTreeSelectValue | null> = Omit<
    PickerFieldProps<PageTreeSelectValue, FieldValue>,
    "renderValue" | "renderPicker"
>;

/**
 * A React Final Form field to choose a page from the page tree, built with `@dextinity/ui`. Its value is the chosen page, or `null`.
 */
export function PageTreeSelectField<FieldValue = PageTreeSelectValue | null>({
    placeholder,
    labels,
    ...props
}: PageTreeSelectFieldProps<FieldValue>) {
    const intl = useIntl();
    return (
        <PickerField<PageTreeSelectValue, FieldValue>
            {...props}
            placeholder={placeholder ?? intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.label", defaultMessage: "Select Page" })}
            labels={{ clear: intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.clear", defaultMessage: "Remove page" }), ...labels }}
            icon={<Icon name="file" />}
            renderValue={renderPageTreeSelectValue}
            renderPicker={({ open, value, onChange, onClose }) =>
                open ? <PageTreeSelectDialog open value={value} onChange={onChange} onClose={onClose} /> : null
            }
        />
    );
}
