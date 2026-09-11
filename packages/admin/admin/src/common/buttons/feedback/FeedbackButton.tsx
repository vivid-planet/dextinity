import { ThreeDotSaving } from "@dextinity/admin-icons";
import type { ComponentsOverrides } from "@mui/material";
import { type Theme, useThemeProps } from "@mui/material/styles";
import { type ReactNode, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

import { createComponentSlot } from "../../../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../../../helpers/ThemedComponentBaseProps";
import { Tooltip as BaseTooltip } from "../../Tooltip";
import { Button, type ButtonClassKey, type ButtonProps } from "../Button";

export type FeedbackButtonClassKey = "idle" | "loading" | "success" | "error" | "tooltip" | ButtonClassKey;

type OwnerState = { displayState: FeedbackButtonDisplayState };

const Root = createComponentSlot(Button)<FeedbackButtonClassKey, OwnerState>({
    componentName: "FeedbackButton",
    slotName: "root",
    classesResolver(ownerState) {
        return [
            ownerState.displayState === "idle" && "idle",
            ownerState.displayState === "error" && "error",
            ownerState.displayState === "success" && "success",
            ownerState.displayState === "loading" && "loading",
        ];
    },
})();

const Tooltip = createComponentSlot(BaseTooltip)<FeedbackButtonClassKey>({
    componentName: "FeedbackButton",
    slotName: "tooltip",
})();

export interface FeedbackButtonProps
    extends ThemedComponentBaseProps<{
            root: typeof Button;
            tooltip: typeof BaseTooltip;
        }>,
        Omit<ButtonProps, "slotProps"> {
    onClick?: () => void | Promise<void>;
    hasErrors?: boolean;
    loading?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    tooltipSuccessMessage?: ReactNode;
    tooltipErrorMessage?: ReactNode;
}

type FeedbackButtonDisplayState = "idle" | "loading" | "success" | "error";

export function FeedbackButton(inProps: FeedbackButtonProps) {
    const {
        onClick,
        loading,
        hasErrors,
        children,
        classes,
        disabled,
        startIcon,
        endIcon,
        tooltipSuccessMessage = <FormattedMessage id="dextinity.feedbackButton.tooltipSuccessMessage" defaultMessage="Success" />,
        tooltipErrorMessage = <FormattedMessage id="dextinity.feedbackButton.tooltipErrorMessage" defaultMessage="Error" />,
        slotProps,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminFeedbackButton",
    });

    const [displayState, setDisplayState] = useState<FeedbackButtonDisplayState>("idle");

    const ownerState: OwnerState = {
        displayState,
    };

    const isUncontrolled = loading === undefined && hasErrors === undefined;

    const resolveTooltipColorForDisplayState = (displayState: FeedbackButtonDisplayState) => {
        switch (displayState) {
            case "error":
                return "error";
            case "success":
                return "success";
            default:
                return "light";
        }
    };

    const handleOnClick =
        isUncontrolled && onClick
            ? async () => {
                  try {
                      setDisplayState("loading");
                      await onClick();
                      setDisplayState("success");
                  } catch {
                      setDisplayState("error");
                  } finally {
                      setTimeout(() => {
                          setDisplayState("idle");
                      }, 3000);
                  }
              }
            : onClick;

    useEffect(() => {
        if (isUncontrolled) {
            return;
        }

        let timeoutId: number | undefined;
        let timeoutDuration: number | undefined;
        let newDisplayState: FeedbackButtonDisplayState;

        if (displayState === "idle" && loading) {
            setDisplayState("loading");
        } else if (displayState === "loading" && hasErrors) {
            timeoutDuration = 0;
            newDisplayState = "error";
        } else if (displayState === "loading" && !loading && !hasErrors) {
            timeoutDuration = 50;
            newDisplayState = "success";
        } else if (displayState === "error") {
            timeoutDuration = 5000;
            newDisplayState = "idle";
        } else if (displayState === "success") {
            timeoutDuration = 2000;
            newDisplayState = "idle";
        }

        if (timeoutDuration !== undefined) {
            timeoutId = window.setTimeout(() => {
                setDisplayState(newDisplayState);
            }, timeoutDuration);
        }
        return () => {
            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [displayState, loading, hasErrors, isUncontrolled]);

    const tooltip = (
        <Tooltip
            title={displayState === "error" ? tooltipErrorMessage : displayState === "success" ? tooltipSuccessMessage : ""}
            open={displayState === "error" || displayState === "success"}
            placement={endIcon && !startIcon ? "top-end" : "top-start"}
            color={resolveTooltipColorForDisplayState(displayState)}
            {...slotProps?.tooltip}
        >
            <span>{startIcon || endIcon}</span>
        </Tooltip>
    );

    return (
        <Root
            onClick={handleOnClick}
            ownerState={ownerState}
            loading={loading !== undefined ? loading : displayState === "loading"}
            disabled={disabled || (loading !== undefined ? loading : displayState === "loading")}
            loadingPosition={startIcon ? "start" : "end"}
            loadingIndicator={<ThreeDotSaving />}
            startIcon={startIcon && tooltip}
            endIcon={endIcon && !startIcon ? tooltip : endIcon}
            {...slotProps?.root}
            {...restProps}
        >
            {children}
        </Root>
    );
}

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminFeedbackButton: FeedbackButtonClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminFeedbackButton: FeedbackButtonProps;
    }

    interface Components {
        DextinityAdminFeedbackButton?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminFeedbackButton"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminFeedbackButton"];
        };
    }
}
