import { type ComponentsOverrides, css, type Theme, Typography, useThemeProps } from "@mui/material";
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode, useMemo } from "react";
import { FormattedMessage, type MessageDescriptor, useIntl } from "react-intl";

import { Tooltip as CommonTooltip } from "../../common/Tooltip";
import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";
import type { MainNavigationChild, MainNavigationCollapsibleItemProps } from "./CollapsibleItem";
import type { MainNavigationItemProps } from "./Item";
import type { MainNavigationItemRouterLinkProps } from "./ItemRouterLink";

export type MainNavigationItemGroupClassKey = "root" | "open" | "tooltip" | "titleContainer" | "title" | "shortTitle";

type OwnerState = {
    open: boolean;
};

const Root = createComponentSlot("div")<MainNavigationItemGroupClassKey, OwnerState>({
    componentName: "MainNavigationItemGroup",
    slotName: "root",
    classesResolver: (ownerState) => {
        return [ownerState.open && "open"];
    },
})(
    ({ theme }) => css`
        margin-top: ${theme.spacing(8)};
    `,
);

const Tooltip = createComponentSlot(CommonTooltip)<MainNavigationItemGroupClassKey>({
    componentName: "MainNavigationItemGroup",
    slotName: "tooltip",
})();

const TitleContainer = createComponentSlot("div")<MainNavigationItemGroupClassKey, OwnerState>({
    componentName: "MainNavigationItemGroup",
    slotName: "titleContainer",
})(
    ({ theme, ownerState }) => css`
        border-bottom: 1px solid ${theme.palette.grey[50]};
        display: flex;
        justify-content: flex-start;
        padding: ${theme.spacing(2, 4)};
        align-items: center;
        gap: ${theme.spacing(1)};

        ${
            !ownerState.open &&
            css`
                padding-left: 0;
                padding-right: 0;
            `
        }
    `,
);

const Title = createComponentSlot(Typography)<MainNavigationItemGroupClassKey, OwnerState>({
    componentName: "MainNavigationItemGroup",
    slotName: "title",
})(
    ({ theme, ownerState }) => css`
        color: ${theme.palette.grey[900]};
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        ${
            !ownerState.open &&
            css`
                display: none;
            `
        }
    `,
);

const ShortTitle = createComponentSlot(Typography)<MainNavigationItemGroupClassKey, OwnerState>({
    componentName: "MainNavigationItemGroup",
    slotName: "shortTitle",
})(
    ({ theme, ownerState }) => css`
        border: 1px solid ${theme.palette.grey[100]};
        border-radius: 20px;
        color: ${theme.palette.grey[300]};
        padding: 1px 7px;
        margin-left: 20px;
        margin-right: auto;

        ${
            ownerState.open &&
            css`
                display: none;
            `
        }
    `,
);

export interface MainNavigationItemGroupProps extends ThemedComponentBaseProps<{
    root: "div";
    tooltip: typeof CommonTooltip;
    titleContainer: "div";
    title: typeof Typography;
    shortTitle: typeof Typography;
}> {
    title: ReactNode;
    shortTitle?: ReactNode;
    helperIcon?: ReactNode;
    children?: ReactNode;
    isMenuOpen?: boolean;
}

export const MainNavigationItemGroup = (inProps: MainNavigationItemGroupProps) => {
    const { title, shortTitle, helperIcon, children, isMenuOpen, slotProps, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminMainNavigationItemGroup",
    });

    const intl = useIntl();

    const ownerState: OwnerState = { open: Boolean(isMenuOpen) };

    function isFormattedMessage(node: ReactNode): node is ReactElement<MessageDescriptor> {
        return !!node && isValidElement(node) && node.type === FormattedMessage;
    }

    function getInitials(title: ReactNode) {
        let titleAsString: string;
        if (typeof title === "string") {
            titleAsString = title;
        } else if (isFormattedMessage(title)) {
            titleAsString = intl.formatMessage(title.props);
        } else {
            throw new TypeError("Title must be either a string or a FormattedMessage");
        }
        const words = titleAsString.split(/\s+/).filter((word) => word.match(/[A-Za-z]/));

        if (words.length > 3) {
            console.warn("Title has more than 3 words, only the first 3 will be used.");

            return words
                .slice(0, 3)
                .map((word) => word[0].toUpperCase())
                .join("");
        }
        return words.map((word) => word[0].toUpperCase()).join("");
    }

    const childElements = useMemo(
        () =>
            Children.map(children, (child: MainNavigationChild) => {
                return cloneElement<MainNavigationCollapsibleItemProps | MainNavigationItemRouterLinkProps | MainNavigationItemProps>(child, {
                    isMenuOpen,
                });
            }),
        [children, isMenuOpen],
    );

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            <Tooltip
                placement="right"
                disableHoverListener={isMenuOpen}
                disableFocusListener={isMenuOpen}
                disableTouchListener={isMenuOpen}
                title={title}
                {...slotProps?.tooltip}
            >
                <TitleContainer ownerState={ownerState} {...slotProps?.titleContainer}>
                    <ShortTitle variant="overline" ownerState={ownerState} {...slotProps?.shortTitle}>
                        {shortTitle || getInitials(title)}
                    </ShortTitle>
                    <Title variant="subtitle2" ownerState={ownerState} {...slotProps?.title}>
                        {title}
                    </Title>
                    {isMenuOpen && !!helperIcon && helperIcon}
                </TitleContainer>
            </Tooltip>
            {childElements}
        </Root>
    );
};

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminMainNavigationItemGroup: MainNavigationItemGroupProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminMainNavigationItemGroup: MainNavigationItemGroupClassKey;
    }

    interface Components {
        DextinityAdminMainNavigationItemGroup?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminMainNavigationItemGroup"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminMainNavigationItemGroup"];
        };
    }
}
