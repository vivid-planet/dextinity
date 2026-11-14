import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./Skeleton.module.scss";

type SkeletonVariant = "text" | "row" | "tile" | "block";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SkeletonOwnerState = {
    variant: SkeletonVariant;
};

export interface SkeletonSlotProps {
    /** Props for each `item` slot, one per repetition. */
    item?: SlotPropsValue<SkeletonOwnerState, "span">;
}

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /**
     * The shape of the content that is coming: `text` for lines, `row` for list and tree rows, `tile` for metrics and cards,
     * `block` for larger areas such as a preview.
     *
     * @defaultValue `"text"`
     */
    variant?: SkeletonVariant;
    /**
     * How often the shape repeats, e.g. the number of rows expected.
     *
     * @defaultValue `1`
     */
    count?: number;
    /**
     * The width of the placeholder, as a CSS length or a number of pixels. With several text lines, the last one is shorter.
     *
     * @defaultValue `"100%"`
     */
    width?: number | string;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SkeletonSlotProps;
}

const rowTextWidths = ["80%", "60%", "72%", "50%"];

/**
 * A placeholder in the shape and size of the content that is loading. It is hidden from assistive technology: mark the loading
 * area with `aria-busy` instead.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
    { variant = "text", count = 1, width = "100%", className, slotProps, style, ...restProps },
    ref,
) {
    const ownerState: SkeletonOwnerState = { variant };

    const itemProps = resolveSlotProps<SkeletonOwnerState, "span", "span">({
        ownProps: { className: styles.item },
        slotProps: slotProps?.item,
        ownerState,
    });

    return (
        <span
            aria-hidden
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            className={clsx(styles.root, className)}
            style={{ inlineSize: typeof width === "number" ? `${width}px` : width, ...style }}
        >
            {Array.from({ length: Math.max(1, count) }, (_, index) =>
                variant === "row" ? (
                    <span key={index} {...itemProps}>
                        <span className={clsx(styles.shape, styles.rowLeading)} />
                        <span
                            className={clsx(styles.shape, styles.rowText)}
                            style={{ "--dextinity-skeleton-row-text-width": rowTextWidths[index % rowTextWidths.length] } as CSSProperties}
                        />
                        <span className={clsx(styles.shape, styles.rowTrailing)} />
                    </span>
                ) : (
                    <span key={index} {...itemProps}>
                        <span className={clsx(styles.shape, count > 1 && index === count - 1 && variant === "text" && styles.lastLine)} />
                    </span>
                ),
            )}
        </span>
    );
});
