import { createComponentSlot, type ThemedComponentBaseProps } from "@dextinity/admin";
import { type ComponentsOverrides, css, type Theme, Typography, type TypographyProps, useThemeProps } from "@mui/material";
import type { ElementType } from "react";

import type { SupportedThings } from "./Rte";

// Only block-types used in block-type-map should be styled
type StylableBlockTypes = Extract<
    SupportedThings,
    "header-one" | "header-two" | "header-three" | "header-four" | "header-five" | "header-six" | "blockquote" | "unordered-list" | "ordered-list"
>;

export type RteBlockElementClassKey = StylableBlockTypes | "root";

type OwnerState = Pick<RteBlockElementProps, "type">;

const Root = createComponentSlot(Typography)<RteBlockElementClassKey, OwnerState>({
    componentName: "RteBlockElement",
    slotName: "root",
    classesResolver(ownerState) {
        return [Boolean(ownerState.type) && ownerState.type];
    },
})(
    ({ theme, ownerState }) => css`
        font-size: 16px;
        line-height: 20px;
        font-weight: 300;
        color: ${theme.palette.grey[800]};
        margin-bottom: 10px;

        ${
            ownerState.type === "header-one" &&
            css`
                font-size: 30px;
                line-height: 1.2;
                font-weight: 500;
            `
        }

        ${
            ownerState.type === "header-two" &&
            css`
                font-size: 28px;
                line-height: 1.2;
                font-weight: 500;
            `
        }

        ${
            ownerState.type === "header-three" &&
            css`
                font-size: 26px;
                line-height: 1.2;
                font-weight: 500;
            `
        }

        ${
            ownerState.type === "header-four" &&
            css`
                font-size: 22px;
                line-height: 1.2;
                font-weight: 500;
            `
        }

        ${
            ownerState.type === "header-five" &&
            css`
                font-size: 20px;
                line-height: 1.2;
                font-weight: 500;
            `
        }

        ${
            ownerState.type === "header-six" &&
            css`
                font-size: 18px;
                line-height: 1.2;
                font-weight: 500;
            `
        }

        ${
            ownerState.type === "ordered-list" &&
            css`
                padding-left: 0;
            `
        }

        ${
            ownerState.type === "unordered-list" &&
            css`
                padding-left: 0;
            `
        }

        ${
            ownerState.type === "blockquote" &&
            css`
                display: block;
                position: relative;
                padding-left: 20px;
                padding-top: 5px;
                padding-bottom: 5px;

                &:before {
                    content: "";
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    left: 2px;
                    width: 4px;
                    background-color: ${theme.palette.grey[200]};
                    border-radius: 2px;
                }
            `
        }
    `,
);

export interface RteBlockElementProps
    extends
        ThemedComponentBaseProps<{
            root: typeof Typography;
        }>,
        TypographyProps {
    type?: StylableBlockTypes;
    component?: ElementType;
}

export function BlockElement(inProps: RteBlockElementProps) {
    const { type, slotProps, ...restProps } = useThemeProps({ props: inProps, name: "DextinityAdminRteBlockElement" });
    const ownerState: OwnerState = {
        type,
    };
    return <Root component="div" ownerState={ownerState} {...slotProps?.root} {...restProps} />;
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRteBlockElement: RteBlockElementClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminRteBlockElement: RteBlockElementProps;
    }

    interface Components {
        DextinityAdminRteBlockElement?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminRteBlockElement"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRteBlockElement"];
        };
    }
}
