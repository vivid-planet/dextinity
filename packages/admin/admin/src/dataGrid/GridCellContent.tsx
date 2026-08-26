import { type ComponentsOverrides, css, type Theme, Typography, useThemeProps } from "@mui/material";
import type { ReactNode } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type GridCellContentClassKey = "root" | "hasSecondaryText" | "iconContainer" | "textContainer" | "primaryText" | "secondaryText";

export interface GridCellContentProps
    extends ThemedComponentBaseProps<{
        root: "div";
        textContainer: "div";
        iconContainer: "div";
        primaryText: typeof Typography;
        secondaryText: typeof Typography;
    }> {
    primaryText?: ReactNode;
    secondaryText?: ReactNode;
    children?: ReactNode;
    icon?: ReactNode;
}

type OwnerState = {
    hasSecondaryText: boolean;
};

export const GridCellContent = (inProps: GridCellContentProps) => {
    const { children, primaryText, secondaryText, slotProps, icon, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminGridCellContent",
    });

    const ownerState: OwnerState = {
        hasSecondaryText: Boolean(secondaryText),
    };

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            {icon && <IconContainer {...slotProps?.iconContainer}>{icon}</IconContainer>}
            <TextContainer>
                <PrimaryText ownerState={ownerState} {...slotProps?.primaryText}>
                    {primaryText ? primaryText : children}
                </PrimaryText>
                {ownerState.hasSecondaryText && <SecondaryText {...slotProps?.secondaryText}>{secondaryText}</SecondaryText>}
            </TextContainer>
        </Root>
    );
};

const Root = createComponentSlot("div")<GridCellContentClassKey, OwnerState>({
    componentName: "GridCellContent",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.hasSecondaryText && "hasSecondaryText"];
    },
})(
    ({ theme }) => css`
        display: flex;
        align-items: center;
        gap: ${theme.spacing(2)};
        overflow: hidden;
        line-height: 0;
        height: 100%;
    `,
);

const TextContainer = createComponentSlot("div")<GridCellContentClassKey>({
    componentName: "GridCellContent",
    slotName: "textContainer",
})(css`
    overflow: hidden;
`);

const IconContainer = createComponentSlot("div")<GridCellContentClassKey>({
    componentName: "GridCellContent",
    slotName: "iconContainer",
})(css`
    flex-shrink: 0;
`);

const ellipsisStyles = css`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`;

const PrimaryText = createComponentSlot(Typography)<GridCellContentClassKey, OwnerState>({
    componentName: "GridCellContent",
    slotName: "primaryText",
})(
    ({ theme, ownerState }) => css`
        color: ${theme.palette.grey[800]};
        font-size: 12px;
        font-weight: ${ownerState.hasSecondaryText ? 400 : 300};
        line-height: 16px;
        ${ellipsisStyles}

        ${theme.breakpoints.up("md")} {
            font-size: 14px;
            line-height: 20px;
        }
    `,
);

const SecondaryText = createComponentSlot(Typography)<GridCellContentClassKey>({
    componentName: "GridCellContent",
    slotName: "secondaryText",
})(
    ({ theme }) => css`
        color: ${theme.palette.grey[300]};
        font-size: 10px;
        font-weight: 400;
        line-height: 16px;
        ${ellipsisStyles}

        ${theme.breakpoints.up("md")} {
            font-size: 12px;
        }
    `,
);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminGridCellContent: GridCellContentProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminGridCellContent: GridCellContentClassKey;
    }

    interface Components {
        DextinityAdminGridCellContent?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminGridCellContent"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminGridCellContent"];
        };
    }
}
