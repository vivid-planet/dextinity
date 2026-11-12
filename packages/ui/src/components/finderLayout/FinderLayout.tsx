import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./FinderLayout.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type FinderLayoutOwnerState = Record<string, never>;

export interface FinderLayoutSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<FinderLayoutOwnerState, "div">;
    /** Props for the `window` slot, which holds the finder. */
    window?: SlotPropsValue<FinderLayoutOwnerState, "div">;
}

export interface FinderLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** The page header with upload and new folder, e.g. a `PageHeader`. */
    header: ReactNode;
    /**
     * The finder with its sidebar of places and folders, toolbar, views, and path bar. It fills the window, which takes the height of the
     * viewport below the header. Let users resize the sidebar, and remember the width per user.
     */
    children: ReactNode;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: FinderLayoutSlotProps;
}

/**
 * The layout of a finder page for files and folders, e.g. the assets: the page header, then the finder window at the viewport's height,
 * so that its own areas scroll instead of the page.
 */
export const FinderLayout = forwardRef<HTMLDivElement, FinderLayoutProps>(function FinderLayout(
    { header, children, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: FinderLayoutOwnerState = {};

    const headerProps = resolveSlotProps<FinderLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const windowProps = resolveSlotProps<FinderLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.window },
        slotProps: slotProps?.window,
        ownerState,
    });

    return (
        <div {...restProps} ref={ref} className={clsx(styles.root, className)}>
            <div {...headerProps}>{header}</div>
            <div {...windowProps}>{children}</div>
        </div>
    );
});
