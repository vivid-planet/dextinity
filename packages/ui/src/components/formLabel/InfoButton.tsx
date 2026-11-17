import { mergeProps } from "@base-ui/react/merge-props";
import { type ComponentPropsWithRef, type ElementType, type ReactNode, useRef, useState } from "react";

import { Tooltip, type TooltipOpenChangeReason } from "../tooltip/Tooltip";

export const defaultInfoButtonLabel = "More information";

interface InfoButtonProps {
    info: ReactNode;
    /** Id of the hidden copy of the info, for the control's `aria-describedby`. */
    infoId: string;
    /** Props of the button, including the class of the caller's `infoButton` slot, which styles it with the `infoButton` mixin. */
    buttonProps: ComponentPropsWithRef<"button">;
    IconSlot: ElementType;
    iconProps: object;
}

/**
 * The info button after a label. Hover, keyboard focus, and a tap show the info in a tooltip; a hidden copy of the text describes
 * the control and the button for assistive technology.
 */
export function InfoButton({ info, infoId, buttonProps, IconSlot, iconProps }: InfoButtonProps) {
    const [open, setOpen] = useState(false);
    const pointerTypeRef = useRef<string | undefined>(undefined);
    const openedByTapRef = useRef(false);

    const handleOpenChange = (nextOpen: boolean, { reason }: { reason: TooltipOpenChangeReason }) => {
        // After a tap, the browser sends emulated mouse events that end in a mouseleave, which would close the tooltip right away
        if (!nextOpen && openedByTapRef.current && reason === "trigger-hover") {
            return;
        }
        openedByTapRef.current = false;
        setOpen(nextOpen);
    };

    // A tap on a touch screen neither hovers nor focuses the button visibly, so a press opens the tooltip as well
    const ownProps: ComponentPropsWithRef<"button"> = {
        type: "button",
        "aria-describedby": infoId,
        onPointerDown: (event) => {
            pointerTypeRef.current = event.pointerType;
        },
        onClick: () => {
            openedByTapRef.current = pointerTypeRef.current === "touch" || pointerTypeRef.current === "pen";
            setOpen(true);
        },
    };

    return (
        <>
            <Tooltip content={info} open={open} onOpenChange={handleOpenChange} closeOnClick={false}>
                <button {...mergeProps<"button">(ownProps, buttonProps)}>
                    <IconSlot {...iconProps} />
                </button>
            </Tooltip>
            <span id={infoId} hidden>
                {info}
            </span>
        </>
    );
}
