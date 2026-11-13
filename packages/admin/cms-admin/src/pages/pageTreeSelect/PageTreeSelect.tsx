import { Icon, Picker, type PickerProps } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";

import { PageTreeSelectDialog, type PageTreeSelectValue } from "./PageTreeSelectDialog";

export interface PageTreeSelectProps extends Omit<
    PickerProps<PageTreeSelectValue>,
    "value" | "onChange" | "renderValue" | "onOpen" | "onClear" | "label"
> {
    /**
     * The field's label.
     *
     * @defaultValue "Page"
     */
    label?: PickerProps<PageTreeSelectValue>["label"];
    value: PageTreeSelectValue | undefined | null;
    onChange: (newValue: PageTreeSelectValue | null) => void;
    /**
     * Shows a button that clears the chosen page.
     *
     * @defaultValue `true`, unless `required`
     */
    clearable?: boolean;
}

/**
 * Shows a page's name and path, as the value of a page tree select.
 */
export function renderPageTreeSelectValue(page: PageTreeSelectValue): ReactNode {
    return (
        <>
            <Icon name={page.documentType === "Link" ? "link" : "file"} />
            <PageName>{page.name}</PageName>
            <PagePath>{page.path}</PagePath>
        </>
    );
}

/**
 * A field showing the chosen page that opens the `PageTreeSelectDialog` to choose another one, built with `@dextinity/ui`. For forms,
 * use `PageTreeSelectField`.
 */
export function PageTreeSelect({ value, onChange, clearable, label, placeholder, labels, required, ...pickerProps }: PageTreeSelectProps) {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const showsClear = clearable ?? !required;

    return (
        <>
            <Picker<PageTreeSelectValue>
                {...pickerProps}
                label={label ?? intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.fieldLabel", defaultMessage: "Page" })}
                required={required}
                value={value ?? null}
                renderValue={renderPageTreeSelectValue}
                placeholder={placeholder ?? intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.label", defaultMessage: "Select Page" })}
                icon={<Icon name="file" />}
                labels={{ clear: intl.formatMessage({ id: "dextinity.pages.pageTreeSelect.clear", defaultMessage: "Remove page" }), ...labels }}
                onOpen={() => setOpen(true)}
                onClear={showsClear ? () => onChange(null) : undefined}
            />
            {/* Mounted only while open, so that the page tree is only queried then */}
            {open && (
                <PageTreeSelectDialog
                    open
                    value={value}
                    onChange={(newValue) => {
                        onChange(newValue);
                        setOpen(false);
                    }}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}

const PageName = styled("span")`
    overflow: hidden;
    text-overflow: ellipsis;
`;

const PagePath = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
    text-overflow: ellipsis;
`;
