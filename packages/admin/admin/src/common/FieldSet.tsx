import { ChevronRight } from "@dextinity/admin-icons";
import type { ComponentsOverrides, Theme } from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import { css, useThemeProps } from "@mui/material/styles";
import { type PropsWithChildren, type ReactNode, type SyntheticEvent, useState } from "react";

import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";

export interface FieldSetProps
    extends ThemedComponentBaseProps<{
        root: typeof MuiAccordion;
        summary: typeof MuiAccordionSummary;
        headerColumn: "div";
        title: "div";
        supportText: "div";
        placeholder: "div";
        endAdornment: "div";
        children: typeof MuiAccordionDetails;
    }> {
    title?: ReactNode;
    supportText?: ReactNode;
    endAdornment?: ReactNode;
    collapsible?: boolean;
    initiallyExpanded?: boolean;
    disablePadding?: boolean;
}

export type FieldSetClassKey =
    | "root"
    | "hiddenSummary"
    | "summary"
    | "headerColumn"
    | "title"
    | "supportText"
    | "endAdornment"
    | "placeholder"
    | "children"
    | "disablePadding";

type OwnerState = {
    disablePadding: boolean;
    hiddenSummary: boolean;
    collapsible: boolean;
};

export const FieldSet = (inProps: PropsWithChildren<FieldSetProps>) => {
    const {
        title,
        supportText,
        endAdornment,
        children,
        collapsible = true,
        initiallyExpanded = true,
        disablePadding = false,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminFieldSet" });
    const [expanded, setExpanded] = useState(initiallyExpanded);

    const handleChange = (event: SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded);
    };

    const ownerState: OwnerState = {
        disablePadding,
        hiddenSummary: !title,
        collapsible,
    };

    return (
        <Root
            expanded={expanded}
            onChange={
                collapsible
                    ? handleChange
                    : () => {
                          /* do nothing */
                      }
            }
            ownerState={ownerState}
            {...slotProps?.root}
            {...restProps}
        >
            {!ownerState.hiddenSummary && (
                <Summary expandIcon={collapsible ? <ChevronRight /> : undefined} disabled={!collapsible} {...slotProps?.summary}>
                    <HeaderColumn {...slotProps?.headerColumn}>
                        <Title ownerState={ownerState} {...slotProps?.title}>
                            {title}
                        </Title>
                        <SupportText {...slotProps?.supportText}>{supportText}</SupportText>
                    </HeaderColumn>
                    <Placeholder {...slotProps?.placeholder} />
                    <EndAdornment {...slotProps?.endAdornment}>{endAdornment}</EndAdornment>
                </Summary>
            )}
            <Children ownerState={ownerState} {...slotProps?.children}>
                {children}
            </Children>
        </Root>
    );
};

const Root = createComponentSlot(MuiAccordion)<FieldSetClassKey, OwnerState>({
    componentName: "FieldSet",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.hiddenSummary && "hiddenSummary"];
    },
})();

const Summary = createComponentSlot(MuiAccordionSummary)<FieldSetClassKey>({
    componentName: "FieldSet",
    slotName: "summary",
})(
    ({ theme }) => css`
        display: flex;
        flex-direction: row-reverse;
        padding: 0 10px;
        height: 60px;

        ${theme.breakpoints.up("sm")} {
            padding: 0 20px;
            height: 80px;
        }
    `,
);

const HeaderColumn = createComponentSlot("div")<FieldSetClassKey>({
    componentName: "FieldSet",
    slotName: "headerColumn",
})(
    ({ theme }) => css`
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        align-content: center;
        padding: 0px;

        ${theme.breakpoints.up("sm")} {
            padding: 10px;
        }
    `,
);

const Title = createComponentSlot("div")<FieldSetClassKey, OwnerState>({
    componentName: "FieldSet",
    slotName: "title",
})(
    ({ theme, ownerState }) => css`
        display: flex;
        align-items: center;
        font-weight: ${theme.typography.fontWeightMedium};
        font-size: 16px;
        text-transform: uppercase;
        color: ${theme.palette.text.primary};

        ${!ownerState.collapsible &&
        css`
            // MUIAccordionSummary inherits from ButtonBase. Overriding the styling of a disabled button is necessary to align with the design.
            opacity: 1;
        `}
    `,
);

const SupportText = createComponentSlot("div")<FieldSetClassKey>({
    componentName: "FieldSet",
    slotName: "supportText",
})(
    ({ theme }) => css`
        font-size: 12px;
        line-height: 18px;
        color: ${theme.palette.text.secondary};
    `,
);

const Placeholder = createComponentSlot("div")<FieldSetClassKey>({
    componentName: "FieldSet",
    slotName: "placeholder",
})(css`
    flex-grow: 1;
    box-sizing: inherit;
    user-select: none;
`);

const EndAdornment = createComponentSlot("div")<FieldSetClassKey>({
    componentName: "FieldSet",
    slotName: "endAdornment",
})(css`
    display: flex;
    align-items: center;
`);

const Children = createComponentSlot(MuiAccordionDetails)<FieldSetClassKey, OwnerState>({
    componentName: "FieldSet",
    slotName: "children",
    classesResolver(ownerState) {
        return [ownerState.disablePadding && "disablePadding"];
    },
})(
    ({ theme, ownerState }) => css`
        padding: 20px;

        ${!ownerState.hiddenSummary &&
        css`
            border-top: 1px solid ${theme.palette.divider};
        `}

        ${theme.breakpoints.up("sm")} {
            padding: 40px;
        }

        ${ownerState.disablePadding &&
        css`
            padding: 0;

            ${theme.breakpoints.up("sm")} {
                padding: 0;
            }
        `}
    `,
);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminFieldSet: FieldSetProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminFieldSet: FieldSetClassKey;
    }

    interface Components {
        DextinityAdminFieldSet?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFieldSet"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFieldSet"];
        };
    }
}
