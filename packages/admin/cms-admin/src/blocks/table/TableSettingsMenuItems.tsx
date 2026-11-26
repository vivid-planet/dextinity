import { RowActionsItem, RowActionsMenu } from "@dextinity/admin";
import { Check, Settings } from "@dextinity/admin-icons";

import type { TableSettingsDeclaration, TableSettingsState } from "./createTableSettings";

type Props = {
    settings: TableSettingsDeclaration;
    values: TableSettingsState;
    onChange: (key: string, value: unknown) => void;
};

export const hasTableSettings = (settings: TableSettingsDeclaration) => Object.keys(settings).length > 0;

export const TableSettingsMenuItems = ({ settings, values, onChange }: Props) =>
    Object.entries(settings).map(([key, field]) => {
        const value = values[key];

        if (field.type === "checkbox") {
            const isChecked = value === true;

            return (
                <RowActionsItem
                    key={key}
                    icon={<CheckMark isChecked={isChecked} />}
                    onClick={() => onChange(key, !isChecked)}
                    componentsProps={{ menuItem: { role: "menuitemcheckbox", "aria-checked": isChecked } }}
                >
                    {field.label}
                </RowActionsItem>
            );
        }

        if (field.type === "multiSelect") {
            const selectedValues = Array.isArray(value) ? value : [];

            return (
                <RowActionsMenu key={key} text={field.label} icon={field.icon ?? <Settings />}>
                    {field.options.map((option) => {
                        const isChecked = selectedValues.includes(option.value);

                        return (
                            <RowActionsItem
                                key={option.value}
                                icon={<CheckMark isChecked={isChecked} />}
                                onClick={() =>
                                    onChange(
                                        key,
                                        isChecked
                                            ? selectedValues.filter((selectedValue) => selectedValue !== option.value)
                                            : [...selectedValues, option.value],
                                    )
                                }
                                componentsProps={{ menuItem: { role: "menuitemcheckbox", "aria-checked": isChecked } }}
                            >
                                {option.label}
                            </RowActionsItem>
                        );
                    })}
                </RowActionsMenu>
            );
        }

        return (
            <RowActionsMenu key={key} text={field.label} icon={field.icon ?? <Settings />}>
                {field.options.map((option) => (
                    <RowActionsItem
                        key={option.value}
                        onClick={() => onChange(key, option.value)}
                        componentsProps={{ menuItem: { selected: value === option.value } }}
                    >
                        {option.label}
                    </RowActionsItem>
                ))}
            </RowActionsMenu>
        );
    });

// Takes up the space of the icon when unchecked, so the label lines up with the labels of the other items
const CheckMark = ({ isChecked }: { isChecked: boolean }) => <Check sx={{ visibility: isChecked ? "visible" : "hidden" }} />;
