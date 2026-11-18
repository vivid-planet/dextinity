# Helper: EnumChip

Generic chip wrapper with dropdown menu. Search for it in the project.

Create this file if it does not exist.

```tsx
import { type ChipProps as MuiChipProps, ListItemText, Menu, MenuItem } from "@mui/material";
import { type ComponentType, type ReactNode, useState } from "react";

export type EnumChipProps<T extends string> = {
    chipMap: EnumChipMap<T>;
    formattedMessageMap: EnumFormattedMessageMap<T>;
    loading?: boolean;
    onSelectItem?: (status: T) => void;
    sortOrder?: T[];
    value: T;
};
type EnumChipItemProps = { loading: boolean; onClick?: MuiChipProps["onClick"] };
type EnumChipMap<T extends string> = Record<T, ComponentType<EnumChipItemProps>>;
type EnumFormattedMessageMap<T extends string> = Record<T, ReactNode>;

function keysFromObject<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}

export function EnumChip<T extends string>({ chipMap, formattedMessageMap, loading = false, onSelectItem, sortOrder = [], value }: EnumChipProps<T>) {
    const [anchorElement, setAnchorElement] = useState<Element | null>(null);

    const StatusChip: ComponentType<EnumChipItemProps> = chipMap[value];
    const open = !!anchorElement;

    return (
        <>
            <StatusChip loading={loading} onClick={onSelectItem != null ? (event) => setAnchorElement(event.currentTarget) : undefined} />

            <Menu anchorEl={anchorElement} onClose={() => setAnchorElement(null)} open={open}>
                {keysFromObject(formattedMessageMap)
                    .sort((a, b) => {
                        return sortOrder.indexOf(a) - sortOrder.indexOf(b);
                    })
                    .map((currentValue) => (
                        <MenuItem
                            disabled={value === currentValue}
                            key={currentValue}
                            onClick={() => {
                                onSelectItem?.(currentValue);
                                setAnchorElement(null);
                            }}
                        >
                            <ListItemText>{formattedMessageMap[currentValue]}</ListItemText>
                        </MenuItem>
                    ))}
            </Menu>
        </>
    );
}
```
