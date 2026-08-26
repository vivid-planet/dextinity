import { createComponentSlot, type ThemedComponentBaseProps } from "@dextinity/admin";
import { ButtonGroup, type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material";

import LinkToolbarButton from "../extension/Link/ToolbarButton";
import LinksRemoveToolbarButton from "../extension/LinksRemove/ToolbarButton";
import type { IControlProps } from "../types";

export interface RteLinkControlsProps
    extends IControlProps,
        ThemedComponentBaseProps<{
            root: typeof ButtonGroup;
            item: "div";
        }> {}

function StyledLinkControls(inProps: RteLinkControlsProps) {
    const props = useThemeProps({ props: inProps, name: "DextinityAdminRteLinkControls" });
    const {
        options: { supports: supportedThings, overwriteLinkButton, overwriteLinksRemoveButton },
        slotProps,
        ...restProps
    } = props;

    const LinkButtonComponent = overwriteLinkButton ? overwriteLinkButton : LinkToolbarButton;
    const LinksRemoveButtonComponent = overwriteLinksRemoveButton ? overwriteLinksRemoveButton : LinksRemoveToolbarButton;

    return (
        <Root {...slotProps?.root} {...restProps}>
            <Item {...slotProps?.item}>{supportedThings.includes("link") && <LinkButtonComponent {...props} />}</Item>
            <Item {...slotProps?.item}>{supportedThings.includes("links-remove") && <LinksRemoveButtonComponent {...props} />}</Item>
        </Root>
    );
}

export type RteLinkControlsClassKey = "root" | "item";

const Root = createComponentSlot(ButtonGroup)<RteLinkControlsClassKey>({
    componentName: "RteLinkControls",
    slotName: "root",
})();

const Item = createComponentSlot("div")<RteLinkControlsClassKey>({
    componentName: "RteLinkControls",
    slotName: "item",
})(css`
    margin-right: 1px;
    min-width: 0;
    &:last-child {
        margin-right: 0;
    }
`);

// If there are no link-actions, this must return null not just an empty component, to prevent an empty item from being rendered in Toolbar
export default (p: IControlProps) => {
    const supportedThings = p.options.supports;

    if (!supportedThings.includes("link") && !supportedThings.includes("links-remove")) {
        return null;
    }

    return <StyledLinkControls {...p} />;
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminRteLinkControls: RteLinkControlsProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminRteLinkControls: RteLinkControlsClassKey;
    }

    interface Components {
        DextinityAdminRteLinkControls?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminRteLinkControls"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRteLinkControls"];
        };
    }
}
