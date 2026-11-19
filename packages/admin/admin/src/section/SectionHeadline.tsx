import { Info } from "@dextinity/admin-icons";
import { type ComponentsOverrides, Divider, Typography } from "@mui/material";
import { css, type Theme, useThemeProps } from "@mui/material/styles";
import { type ComponentProps, isValidElement, type ReactElement, type ReactNode } from "react";

import { Tooltip } from "../common/Tooltip";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export type SectionHeadlineClassKey = "root" | "header" | "titleContainer" | "headline" | "divider" | "supportText" | "infoTooltip";

export interface SectionHeadlineProps extends ThemedComponentBaseProps<{
    root: "div";
    header: "div";
    titleContainer: "div";
    headline: typeof Typography;
    infoTooltip: typeof Tooltip;
    supportText: typeof Typography;
    divider: typeof Divider;
}> {
    children: ReactNode;
    divider?: boolean;
    supportText?: ReactNode;
    infoTooltip?: ReactNode | Omit<ComponentProps<typeof InfoTooltip>, "children">;
    /*
     * @deprecated Use the `infoTooltip` prop instead
     */
    infoTooltipText?: ReactNode;
    iconMapping?: {
        tooltip?: ReactElement;
    };
}

export function SectionHeadline(inProps: SectionHeadlineProps) {
    const {
        children,
        divider,
        supportText,
        infoTooltip,
        infoTooltipText,
        iconMapping = {},
        slotProps,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminSectionHeadline",
    });

    const { tooltip: tooltipIcon = <Info sx={{ fontSize: "inherit" }} /> } = iconMapping;
    const infoTooltipProps = getTooltipProps(infoTooltip);

    return (
        <Root {...slotProps?.root} {...restProps}>
            <Header {...slotProps?.header}>
                <TitleContainer {...slotProps?.titleContainer}>
                    <Headline variant="h4" {...slotProps?.headline}>
                        {children}
                    </Headline>
                    {(infoTooltipText || infoTooltipProps || slotProps?.infoTooltip?.title !== undefined) && (
                        <InfoTooltip title={infoTooltipText} {...infoTooltipProps} {...slotProps?.infoTooltip}>
                            {tooltipIcon}
                        </InfoTooltip>
                    )}
                </TitleContainer>

                {supportText && (
                    <SupportText variant="caption" {...slotProps?.supportText}>
                        {supportText}
                    </SupportText>
                )}
            </Header>

            {divider && <StyledDivider {...slotProps?.divider} />}
        </Root>
    );
}

const getTooltipProps = (infoTooltip: SectionHeadlineProps["infoTooltip"]) => {
    if (!infoTooltip) {
        return null;
    }

    if (isValidElement(infoTooltip) || typeof infoTooltip === "string") {
        return {
            title: infoTooltip,
        };
    }

    if (typeof infoTooltip === "object") {
        return infoTooltip;
    }

    return null;
};

const Root = createComponentSlot("div")<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "root",
})();

const Header = createComponentSlot("div")<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "header",
})(css`
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
`);

const TitleContainer = createComponentSlot("div")<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "titleContainer",
})(css`
    display: flex;
    align-items: center;
`);

const Headline = createComponentSlot(Typography)<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "headline",
})();

const SupportText = createComponentSlot(Typography)<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "supportText",
})(
    ({ theme }) => css`
        color: ${theme.palette.text.secondary};
    `,
);

const InfoTooltip = createComponentSlot(Tooltip)<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "infoTooltip",
})(
    ({ theme }) => css`
        color: ${theme.palette.text.secondary};
        margin-left: 10px;
        font-size: 12px;
    `,
);

const StyledDivider = createComponentSlot(Divider)<SectionHeadlineClassKey>({
    componentName: "SectionHeadline",
    slotName: "divider",
})(css`
    margin-top: 10px;
`);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminSectionHeadline: SectionHeadlineClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminSectionHeadline: SectionHeadlineProps;
    }

    interface Components {
        DextinityAdminSectionHeadline?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminSectionHeadline"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminSectionHeadline"];
        };
    }
}
