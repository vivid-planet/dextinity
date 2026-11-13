import { Field, Select, type SelectOption } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactNode, useMemo } from "react";
import { useIntl } from "react-intl";

import { messageText } from "../../form/messageText";
import type { ColumnsBlockLayout } from "../createColumnsBlock";

interface Section {
    name?: string;
    label?: ReactNode;
    layouts: ColumnsBlockLayout[];
}

function groupLayoutsBySection(layouts: ColumnsBlockLayout[]): Section[] {
    const sections: Section[] = [];

    layouts.forEach((layout) => {
        const name = typeof layout.section === "string" ? layout.section : layout.section?.name;
        const sectionForLayout = sections.find((section) => section.name === name);
        if (sectionForLayout) {
            sectionForLayout.layouts.push(layout);
        } else {
            sections.push({
                name,
                label: typeof layout.section === "object" && layout.section?.label ? layout.section.label : name,
                layouts: [layout],
            });
        }
    });

    return sections.sort((sectionA, sectionB) => (sectionA.name === undefined ? 1 : sectionB.name === undefined ? -1 : 0));
}

interface LayoutSelectProps {
    name: string;
    label: ReactNode;
    layouts: ColumnsBlockLayout[];
    value: ColumnsBlockLayout | null;
    onChange: (layout: ColumnsBlockLayout) => void;
    onBlur?: () => void;
    onFocus?: () => void;
}

export function useLayoutSelectOptions(layouts: ColumnsBlockLayout[]): SelectOption<string>[] {
    const intl = useIntl();

    return useMemo(() => {
        const sections = groupLayoutsBySection(layouts);
        const hasMultipleSections = sections.length > 1;

        return sections.flatMap((section) =>
            section.layouts.map((layout) => {
                const layoutText = messageText(intl, layout.label) ?? layout.name;
                const sectionText = hasMultipleSections && section.label ? messageText(intl, section.label) : undefined;
                return {
                    value: layout.name,
                    label:
                        hasMultipleSections && section.label ? (
                            <OptionLabel>
                                {layout.label}
                                <OptionSection>{section.label}</OptionSection>
                            </OptionLabel>
                        ) : (
                            layout.label
                        ),
                    textValue: sectionText ? `${layoutText}, ${sectionText}` : layoutText,
                    icon: <OptionPreview>{layout.preview}</OptionPreview>,
                };
            }),
        );
    }, [intl, layouts]);
}

/**
 * Chooses a layout of a columns block, showing each layout's preview in the menu. A single layout is shown read-only.
 */
export function LayoutSelect({ name, label, layouts, value, onChange, onBlur, onFocus }: LayoutSelectProps) {
    const options = useLayoutSelectOptions(layouts);

    return (
        <Field
            label={label}
            prefix={value ? <LayoutPreviewPrefix>{value.preview}</LayoutPreviewPrefix> : undefined}
            onBlur={onBlur}
            onFocus={onFocus}
        >
            <Select
                name={name}
                options={options}
                value={value?.name ?? null}
                readOnly={layouts.length === 1}
                onChange={(layoutName) => {
                    const layout = layouts.find((layout) => layout.name === layoutName);
                    if (layout) {
                        onChange(layout);
                    }
                }}
            />
        </Field>
    );
}

const OptionPreview = styled("span")`
    display: flex;
    inline-size: 88px;
`;

export const LayoutPreviewPrefix = styled("span")`
    display: flex;
    inline-size: 56px;
    margin-inline-end: var(--dextinity-space-2);

    & > * {
        block-size: 20px;
        min-inline-size: 0;
    }
`;

const OptionLabel = styled("span")`
    display: inline-flex;
    gap: var(--dextinity-space-2);
    align-items: baseline;
`;

const OptionSection = styled("span")`
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
`;
