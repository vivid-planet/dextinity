import {
    ClickAwayListener,
    Grow,
    type InputBase as MuiInputBase,
    type InputBaseProps,
    type Paper as MuiPaper,
    type Popper as MuiPopper,
} from "@mui/material";
import { useThemeProps } from "@mui/material/styles";
import type { TransitionProps } from "@mui/material/transitions";
import { type ElementType, type ReactNode, type RefObject, useCallback, useEffect, useRef, useState } from "react";

import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { InputBase, Paper, Popper, Root } from "./InputWithPopper.slots";

export type InputWithPopperComponents = InputBaseProps["components"] & {
    Transition?: ElementType<TransitionProps>;
};

type ClosePopper = (focusInput?: boolean) => void;

type BaseProps = ThemedComponentBaseProps<{
    root: "div";
    inputBase: typeof MuiInputBase;
    popper: typeof MuiPopper;
    paper: typeof MuiPaper;
    clickAwayListener: typeof ClickAwayListener;
}>;

export interface InputWithPopperProps extends Omit<InputBaseProps, "components" | "inputRef" | "sx" | "slotProps">, BaseProps {
    children: ((closePopper: ClosePopper) => ReactNode) | ReactNode;
    components?: InputWithPopperComponents;
    onOpenPopper?: () => void;
    onClosePopper?: () => void;
    inputRef?: RefObject<HTMLElement | null>;
    slotProps?: BaseProps["slotProps"] & {
        transition?: TransitionProps;
    };
}

export const InputWithPopper = (inProps: InputWithPopperProps) => {
    const {
        children,
        value = "",
        onOpenPopper,
        onClosePopper,
        components = {},
        inputRef: inputRefProp,
        slotProps,
        ...inputBaseProps
    } = useThemeProps({ props: inProps, name: "DextinityAdminInputWithPopper" });
    const { Transition = Grow, ...inputBaseComponents } = components;

    const rootRef = useRef<HTMLDivElement>(null);
    const ownInputRef = useRef<HTMLElement>(null);
    const [showPopper, setShowPopper] = useState<boolean>(false);

    const inputRef = inputRefProp ?? ownInputRef;

    const closePopper: ClosePopper = useCallback(
        (focusInput) => {
            if (showPopper) {
                if (focusInput) {
                    /**
                     * Focusing on the input, when closing the popper allows the user to continue navigating through the form, using the "Tab" key.
                     * `focus()` needs to happen before closing the popper, to prevent the popper from reopening because of the `onFocus` event.
                     */
                    inputRef.current?.focus();
                }
                setShowPopper(false);
                onClosePopper?.();
            }
        },
        [showPopper, onClosePopper, inputRef, setShowPopper],
    );

    const openPopper = () => {
        if (!showPopper) {
            setShowPopper(true);
            onOpenPopper?.();
        }
    };

    /**
     * Pressing the "Tab" key closes the popper, to allow the user to navigate to the next/previous form element.
     * The `onBlur` of `InputBase` cannot be used, this would close the popper when clicking inside the popper itself, preventing further interaction.
     */
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab" || e.key === "Escape") {
                closePopper(true);
            }
        };

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [closePopper]);

    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={() => {
                closePopper();
            }}
            {...slotProps?.clickAwayListener}
        >
            <Root ref={rootRef} {...slotProps?.root}>
                <InputBase
                    autoComplete="off"
                    value={value}
                    {...inputBaseProps}
                    inputRef={inputRef}
                    onFocus={(e) => {
                        inputBaseProps.onFocus?.(e);
                        openPopper();
                    }}
                    components={inputBaseComponents}
                    {...slotProps?.inputBase}
                    slotProps={{
                        ...slotProps?.inputBase?.slotProps,
                        input: {
                            ...slotProps?.inputBase?.slotProps?.input,
                            onClick: (e) => {
                                slotProps?.inputBase?.slotProps?.input?.onClick?.(e);
                                /**
                                 * Opening the popper when clicking inside the `input`, is necessary to allow the user to re-open the popper,
                                 * when the input is already in focus but the popper has been closed.
                                 */
                                openPopper();
                            },
                        },
                    }}
                />
                <Popper open={showPopper} anchorEl={rootRef.current} placement="bottom-start" transition {...slotProps?.popper}>
                    {({ TransitionProps }) => (
                        <Transition {...TransitionProps} {...slotProps?.transition}>
                            <Paper {...slotProps?.paper}>{typeof children === "function" ? children(closePopper) : children}</Paper>
                        </Transition>
                    )}
                </Popper>
            </Root>
        </ClickAwayListener>
    );
};
