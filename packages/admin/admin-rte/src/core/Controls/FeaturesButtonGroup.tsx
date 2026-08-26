import { createComponentSlot, type ThemedComponentBaseProps, Tooltip } from "@dextinity/admin";
import { MoreHorizontal } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, ListItemIcon as MuiListItemIcon, Menu, MenuItem, type Theme, useThemeProps } from "@mui/material";
import type { Editor } from "draft-js";
import { type MouseEvent, type RefObject, useState } from "react";
import { FormattedMessage } from "react-intl";

import type { IFeatureConfig } from "../types";
import { ControlButton } from "./ControlButton";

interface IProps
    extends ThemedComponentBaseProps<{
        root: "div";
        buttonWrapper: "div";
        listItem: typeof MenuItem;
        listItemIcon: typeof MuiListItemIcon;
    }> {
    features: IFeatureConfig[];
    disabled?: boolean;
    editorRef: RefObject<Editor | null>;
    maxVisible?: number;
}

export function FeaturesButtonGroup(inProps: IProps) {
    const {
        features,
        disabled: globallyDisabled,
        editorRef,
        maxVisible,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminRteFeaturesButtonGroup" });
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMoreOptionsClick = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);

        setTimeout(() => {
            if (editorRef.current) {
                editorRef.current.focus();
            }
        }, 0);
    };

    if (!features.length) {
        return null;
    }

    // Ensures that the dropdown never contains only one feature and that maximum {maxVisible} buttons are shown
    // If maxVisible = 4 and there are four features -> all four features (and no dropdown) are shown
    // If maxVisible = 4 and there are five features -> three features and the dropdown (containing two features) are shown
    const visibleFeatures = maxVisible !== undefined && features.length > maxVisible ? features.slice(0, maxVisible - 1) : features;
    const additionalFeatures = maxVisible !== undefined && features.length > maxVisible ? features.slice(maxVisible - 1) : [];

    return (
        <Root {...slotProps?.root} {...restProps}>
            {visibleFeatures.map(({ name, onButtonClick, tooltipText, disabled, ...rest }) => (
                <ButtonWrapper {...slotProps?.buttonWrapper} key={name}>
                    {tooltipText ? (
                        <Tooltip title={tooltipText} placement="top">
                            <span>
                                <ControlButton onButtonClick={onButtonClick} disabled={globallyDisabled || disabled} {...rest} />
                            </span>
                        </Tooltip>
                    ) : (
                        <ControlButton onButtonClick={onButtonClick} disabled={globallyDisabled || disabled} {...rest} />
                    )}
                </ButtonWrapper>
            ))}
            {additionalFeatures.length > 0 && (
                <>
                    <ButtonWrapper {...slotProps?.buttonWrapper}>
                        <Tooltip
                            title={<FormattedMessage id="dextinity.rte.controls.moreOptionsTooltip" defaultMessage="More options" />}
                            placement="top"
                        >
                            <span>
                                <ControlButton onButtonClick={handleMoreOptionsClick} disabled={globallyDisabled} icon={MoreHorizontal} />
                            </span>
                        </Tooltip>
                    </ButtonWrapper>
                    <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={handleMenuClose}>
                        {additionalFeatures.map(({ name, onButtonClick, disabled, selected, label, icon: Icon }) => (
                            <ListItem
                                key={name}
                                onMouseDown={(event) => {
                                    handleMenuClose();

                                    // See https://reactjs.org/docs/legacy-event-pooling.html for more information.
                                    event.persist();
                                    setTimeout(() => {
                                        onButtonClick?.(event);
                                    }, 0);
                                }}
                                disabled={globallyDisabled || disabled}
                                selected={selected}
                                {...slotProps?.listItem}
                            >
                                {label}
                                {Icon && (
                                    <ListItemIcon {...slotProps?.listItemIcon}>
                                        <Icon />
                                    </ListItemIcon>
                                )}
                            </ListItem>
                        ))}
                    </Menu>
                </>
            )}
        </Root>
    );
}

export type RteFeaturesButtonGroupClassKey = "root" | "buttonWrapper" | "listItem" | "listItemIcon";

const Root = createComponentSlot("div")<RteFeaturesButtonGroupClassKey>({
    componentName: "RteFeaturesButtonGroup",
    slotName: "root",
})(css`
    display: inline-flex;
    justify-content: flex-start;
`);

const ButtonWrapper = createComponentSlot("div")<RteFeaturesButtonGroupClassKey>({
    componentName: "RteFeaturesButtonGroup",
    slotName: "buttonWrapper",
})(css`
    margin-right: 1px;
    &:last-child {
        margin-right: 0;
    }
`);

const ListItem = createComponentSlot(MenuItem)<RteFeaturesButtonGroupClassKey>({
    componentName: "RteFeaturesButtonGroup",
    slotName: "listItem",
})(css`
    justify-content: space-between;
`);

const ListItemIcon = createComponentSlot(MuiListItemIcon)<RteFeaturesButtonGroupClassKey>({
    componentName: "RteFeaturesButtonGroup",
    slotName: "listItemIcon",
})(css`
    justify-content: flex-end;
`);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRteFeaturesButtonGroup: RteFeaturesButtonGroupClassKey;
    }

    interface Components {
        DextinityAdminRteFeaturesButtonGroup?: {
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRteFeaturesButtonGroup"];
        };
    }
}
