import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useEffect, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import { IconButton, type IconButtonProps } from "../iconButton/IconButton";
import styles from "./CopyField.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CopyFieldOwnerState = {
    copied: boolean;
};

export interface CopyFieldSlotProps {
    /** Props for the `value` slot, the text that is copied. */
    value?: SlotPropsValue<CopyFieldOwnerState, "span">;
    /** Props for the copy button, e.g. its `size`. */
    button?: Partial<Omit<IconButtonProps, "children" | "aria-label" | "onClick">>;
    /** Props for the `status` slot, the visually hidden text announced after copying. */
    status?: SlotPropsValue<CopyFieldOwnerState, "span">;
}

export interface CopyFieldLabels {
    /** The accessible name and tooltip of the button, e.g. "Copy path". */
    copy: string;
    /** The tooltip and announcement after copying. */
    copied: string;
}

const defaultLabels: CopyFieldLabels = {
    copy: "Copy",
    copied: "Copied",
};

export interface CopyFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onCopy"> {
    /** The text shown and copied, e.g. the URL of a page. */
    value: string;
    /** Called after the value was copied to the clipboard. */
    onCopy?: (value: string) => void;
    /**
     * How long the button shows that the value was copied, in milliseconds.
     *
     * @defaultValue `1600`
     */
    copiedDuration?: number;
    /** The button's texts. Name what is copied in `copy`, e.g. "Copy path". */
    labels?: Partial<CopyFieldLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CopyFieldSlotProps;
}

/**
 * A read-only value in mono with a button that copies it, e.g. the URL of a page. The button confirms the copy in place.
 */
export const CopyField = forwardRef<HTMLDivElement, CopyFieldProps>(function CopyField(
    { value, onCopy, copiedDuration = 1600, labels: labelsProp, className, slotProps, ...restProps },
    ref,
) {
    const [copied, setCopied] = useState(false);
    const ownerState: CopyFieldOwnerState = { copied };
    const labels = { ...defaultLabels, ...labelsProp };

    useEffect(() => {
        if (!copied) {
            return;
        }
        const timeout = window.setTimeout(() => setCopied(false), copiedDuration);
        return () => window.clearTimeout(timeout);
    }, [copied, copiedDuration]);

    async function copy() {
        try {
            await navigator.clipboard.writeText(value);
        } catch {
            // Without clipboard permission, the button stays as it is rather than confirming a copy that didn't happen
            return;
        }
        setCopied(true);
        onCopy?.(value);
    }

    const valueProps = resolveSlotProps<CopyFieldOwnerState, "span", "span">({
        ownProps: { className: styles.value, title: value },
        slotProps: slotProps?.value,
        ownerState,
    });
    const statusProps = resolveSlotProps<CopyFieldOwnerState, "span", "span">({
        ownProps: { className: styles.status, role: "status" },
        slotProps: slotProps?.status,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} data-copied={ownerState.copied ? "" : undefined} className={clsx(styles.root, className)}>
            <span {...valueProps}>{value}</span>
            <IconButton
                variant="text"
                color="secondary"
                size="small"
                {...slotProps?.button}
                className={clsx(styles.button, slotProps?.button?.className)}
                aria-label={copied ? labels.copied : labels.copy}
                onClick={() => void copy()}
            >
                <Icon name={copied ? "check" : "copy"} />
            </IconButton>
            <span {...statusProps}>{copied ? labels.copied : null}</span>
        </div>
    );
});
