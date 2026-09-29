import { createComponentSlot, type ThemedComponentBaseProps } from "@dextinity/admin";
import {
    type ComponentsOverrides,
    css,
    FormControl,
    inputBaseClasses,
    MenuItem,
    Select as MuiSelect,
    selectClasses,
    type Theme,
    useThemeProps,
} from "@mui/material";
import type { ReactNode } from "react";

import type { IControlProps } from "../types";
import getRteTheme from "../utils/getRteTheme";
import useBlockTypes, { type BlockTypesApi } from "./useBlockTypes";

interface Props
    extends ThemedComponentBaseProps<{
            root: typeof FormControl;
            select: typeof MuiSelect;
        }>,
        IControlProps {
    blockTypes: BlockTypesApi;
}

export type RteBlockTypeControlsClassKey = "root" | "select";

const Root = createComponentSlot(FormControl)<RteBlockTypeControlsClassKey>({
    componentName: "RteBlockTypeControls",
    slotName: "root",
})(css`
    .${inputBaseClasses.root} {
        background-color: transparent;
        height: auto;
        border: none;
        &,
        &:hover {
            &:before,
            &:after {
                border-bottom-width: 0;
            }
        }
    }
    .${selectClasses.icon} {
        top: auto;
        color: inherit;
    }
`);

const Select = createComponentSlot(MuiSelect)<RteBlockTypeControlsClassKey>({
    componentName: "RteBlockTypeControls",
    slotName: "select",
})(
    ({ theme }) => css`
        .${selectClasses.select}.${inputBaseClasses.input} {
            min-height: 0;
            color: ${getRteTheme(theme.components?.DextinityAdminRte?.defaultProps).colors.buttonIcon};
            min-width: 180px;
            line-height: 24px;
            font-size: 14px;
            padding: 0;
        }
    `,
);

function StyledBlockTypesControls(inProps: Props) {
    const { disabled, blockTypes, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminRteBlockTypeControls" });
    const { dropdownFeatures, activeDropdownBlockType, handleBlockTypeChange } = blockTypes;

    const blockTypesListItems: Array<{ name: string; label: ReactNode }> = dropdownFeatures.map((c) => ({ name: c.name, label: c.label }));

    return (
        <Root {...slotProps?.root} {...restProps}>
            <Select
                {...slotProps?.select}
                disabled={disabled}
                value={activeDropdownBlockType}
                displayEmpty
                variant="filled"
                MenuProps={{ elevation: 1 }}
                onChange={handleBlockTypeChange}
            >
                {blockTypesListItems.map((c) => (
                    <MenuItem key={c.name} value={c.name} dense>
                        {c.label}
                    </MenuItem>
                ))}
            </Select>
        </Root>
    );
}

// If there are no dropdown-features, this must return null not just an empty component, to prevent an empty item from being rendered in Toolbar
export default (p: IControlProps) => {
    const { editorState, setEditorState, editorRef, options } = p;
    const { supports: supportedThings, blocktypeMap, standardBlockType } = options;
    const blockTypes = useBlockTypes({ editorState, setEditorState, supportedThings, blocktypeMap, editorRef, standardBlockType });

    if (!blockTypes.dropdownFeatures.length) {
        return null;
    }
    return <StyledBlockTypesControls {...p} blockTypes={blockTypes} />;
};

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRteBlockTypeControls: RteBlockTypeControlsClassKey;
    }

    interface Components {
        DextinityAdminRteBlockTypeControls?: {
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRteBlockTypeControls"];
        };
    }
}
