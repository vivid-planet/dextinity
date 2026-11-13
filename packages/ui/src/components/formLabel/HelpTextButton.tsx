import { mergeProps } from "@base-ui/react/merge-props";
import { type ComponentPropsWithRef, type ElementType, type ReactNode, useState } from "react";

import { Tooltip } from "../tooltip/Tooltip";
import styles from "./HelpTextButton.module.scss";

export const defaultHelpTextButtonLabel = "More information";

interface HelpTextButtonProps {
    helpText: ReactNode;
    /** Id of the hidden copy of the help text, for the control's `aria-describedby`. */
    helpTextId: string;
    buttonProps: ComponentPropsWithRef<"button">;
    IconSlot: ElementType;
    iconProps: object;
}

/**
 * The info button after a label. Hover, keyboard focus, and a tap show the help text in a tooltip; a hidden copy of the text describes
 * the control and the button for assistive technology.
 */
export function HelpTextButton({ helpText, helpTextId, buttonProps, IconSlot, iconProps }: HelpTextButtonProps) {
    const [open, setOpen] = useState(false);

    // A tap on a touch screen neither hovers nor focuses the button, so a press opens the tooltip as well
    const ownProps: ComponentPropsWithRef<"button"> = {
        type: "button",
        className: styles.button,
        "aria-describedby": helpTextId,
        onClick: () => setOpen(true),
    };

    return (
        <>
            <Tooltip content={helpText} open={open} onOpenChange={setOpen} closeOnClick={false}>
                <button {...mergeProps<"button">(ownProps, buttonProps)}>
                    <IconSlot {...iconProps} />
                </button>
            </Tooltip>
            <span id={helpTextId} hidden>
                {helpText}
            </span>
        </>
    );
}
