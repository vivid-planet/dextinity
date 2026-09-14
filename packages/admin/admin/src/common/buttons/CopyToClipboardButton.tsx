import { Accept, Copy } from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, Grow, IconButton, type Theme, useThemeProps } from "@mui/material";
import { type ReactNode, useState } from "react";

import { createComponentSlot } from "../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../helpers/ThemedComponentBaseProps";

export interface CopyToClipboardButtonProps
    extends ThemedComponentBaseProps<{
        root: "div";
        copyButtonContainer: "div";
        successButtonContainer: "div";
        copyButton: typeof IconButton;
        successButton: typeof IconButton;
    }> {
    copyText: string;
    copyIcon?: ReactNode;
    successIcon?: ReactNode;
}

export type CopyToClipboardButtonClassKey =
    | "root"
    | "showSuccess"
    | "buttonContainer"
    | "copyButtonContainer"
    | "successButtonContainer"
    | "button"
    | "copyButton"
    | "successButton";

type OwnerState = {
    showSuccess: boolean;
};

export const CopyToClipboardButton = (inProps: CopyToClipboardButtonProps) => {
    const {
        copyText,
        copyIcon = <Copy />,
        successIcon = <Accept />,
        slotProps,
        ...restProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminCopyToClipboardButton" });

    const [showSuccess, setShowSuccess] = useState<boolean>(false);

    const ownerState: OwnerState = {
        showSuccess: showSuccess,
    };

    const copyTextToClipboard = () => {
        navigator.clipboard.writeText(copyText);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
        }, 3000);
    };

    return (
        <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
            <CopyButtonContainer {...slotProps?.copyButtonContainer}>
                <Grow in={!showSuccess}>
                    <CopyButton
                        color="primary"
                        {...slotProps?.copyButton}
                        onClick={(e) => {
                            copyTextToClipboard();
                            slotProps?.copyButton?.onClick?.(e);
                        }}
                    >
                        {copyIcon}
                    </CopyButton>
                </Grow>
            </CopyButtonContainer>
            <SuccessButtonContainer {...slotProps?.successButtonContainer}>
                <Grow in={showSuccess}>
                    <SuccessButton
                        color="success"
                        {...slotProps?.successButton}
                        onClick={(e) => {
                            copyTextToClipboard();
                            slotProps?.successButton?.onClick?.(e);
                        }}
                    >
                        {successIcon}
                    </SuccessButton>
                </Grow>
            </SuccessButtonContainer>
        </Root>
    );
};

const Root = createComponentSlot("div")<CopyToClipboardButtonClassKey, OwnerState>({
    componentName: "CopyToClipboardButton",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.showSuccess && "showSuccess"];
    },
})(css`
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 100%;
`);

const CopyButtonContainer = createComponentSlot("div")<CopyToClipboardButtonClassKey>({
    componentName: "CopyToClipboardButton",
    slotName: "copyButtonContainer",
    classesResolver() {
        return ["buttonContainer"];
    },
})(css`
    position: relative;
    z-index: 2;
`);

const SuccessButtonContainer = createComponentSlot("div")<CopyToClipboardButtonClassKey>({
    componentName: "CopyToClipboardButton",
    slotName: "successButtonContainer",
    classesResolver() {
        return ["buttonContainer"];
    },
})(css`
    position: absolute;
    z-index: 1;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
`);

const CopyButton = createComponentSlot(IconButton)<CopyToClipboardButtonClassKey>({
    componentName: "CopyToClipboardButton",
    slotName: "copyButton",
    classesResolver() {
        return ["button"];
    },
})(css`
    position: relative;
`);

const SuccessButton = createComponentSlot(IconButton)<CopyToClipboardButtonClassKey>({
    componentName: "CopyToClipboardButton",
    slotName: "successButton",
    classesResolver() {
        return ["button"];
    },
})(css`
    position: relative;
`);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminCopyToClipboardButton: CopyToClipboardButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminCopyToClipboardButton: CopyToClipboardButtonProps;
    }

    interface Components {
        DextinityAdminCopyToClipboardButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminCopyToClipboardButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminCopyToClipboardButton"];
        };
    }
}
