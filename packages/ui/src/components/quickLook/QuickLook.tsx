import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useRef } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { FieldContextReset } from "../field/fieldContext";
import { Icon } from "../icon/Icon";
import { IconButton } from "../iconButton/IconButton";
import { KeyboardShortcut } from "../keyboardShortcut/KeyboardShortcut";
import styles from "./QuickLook.module.scss";

export interface QuickLookItem {
    /** The URL of the preview image. */
    src: string;
    /** The file's name, shown as the heading. */
    title: string;
    /** Details next to the name, e.g. "JPG · 2.4 MB · 2400 × 1600". */
    description?: string;
    /** The image's text alternative. Without it, the `title` is used. */
    alt?: string;
}

const defaultLabels = {
    close: "Close",
    previous: "Previous",
    next: "Next",
    browse: "Browse",
    previousKey: "←",
    nextKey: "→",
    closeKey: "Space",
    position: (index: number, count: number) => `${index + 1} / ${count}`,
};

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type QuickLookOwnerState = {
    first: boolean;
    last: boolean;
};

export interface QuickLookSlotProps {
    /** Props for the `backdrop` slot, which darkens the page. */
    backdrop?: SlotPropsValue<QuickLookOwnerState, typeof BaseDialog.Backdrop>;
    /** Props for the `header` slot. */
    header?: SlotPropsValue<QuickLookOwnerState, "div">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<QuickLookOwnerState, "div">;
    /** Props for the `preview` slot, which holds the image. */
    preview?: SlotPropsValue<QuickLookOwnerState, "div">;
    /** Props for the `footer` slot. */
    footer?: SlotPropsValue<QuickLookOwnerState, "div">;
}

export interface QuickLookProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /** Whether quick look is open. Open it with Space on the selected item, e.g. in the finder. */
    open: boolean;
    /** Called when the close button, Escape, Space, or a click outside requests to close quick look. */
    onOpenChange: (open: boolean) => void;
    /** The files to step through. */
    items: QuickLookItem[];
    /** The position of the shown item in `items`. */
    index: number;
    /** Called with the new position when the arrow keys or buttons step to another item. */
    onIndexChange: (index: number) => void;
    /** Actions for the shown item, e.g. an "Edit" `Button`. */
    actions?: ReactNode;
    /** Renders the preview of an item, e.g. a video or a PDF. Without it, the item's image is shown. */
    renderPreview?: (item: QuickLookItem) => ReactNode;
    /** Built-in texts: button names, key names, and the position, e.g. "3 / 12". */
    labels?: Partial<typeof defaultLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: QuickLookSlotProps;
}

function isInteractive(element: EventTarget) {
    return element instanceof HTMLElement && element.closest("button, a, input, textarea, select, [contenteditable='true']") != null;
}

/**
 * A large preview of a file over everything, e.g. an image in the finder. The arrow keys step through the items; Space or
 * Escape close it.
 */
export const QuickLook = forwardRef<HTMLDivElement, QuickLookProps>(function QuickLook(
    { open, onOpenChange, items, index, onIndexChange, actions, renderPreview, labels: labelsProp, className, slotProps, onKeyDown, ...restProps },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: QuickLookOwnerState = { first: index <= 0, last: index >= items.length - 1 };
    const item = items.at(index);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const { anchorRef, container } = useThemePortalContainer<HTMLSpanElement>();

    const step = (offset: number) => {
        const nextIndex = index + offset;
        if (nextIndex >= 0 && nextIndex < items.length) {
            onIndexChange(nextIndex);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) {
            return;
        }
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
        } else if (event.key === " " && !isInteractive(event.target)) {
            event.preventDefault();
            onOpenChange(false);
        }
    };

    const backdropProps = resolveSlotProps<QuickLookOwnerState, typeof BaseDialog.Backdrop, typeof BaseDialog.Backdrop>({
        ownProps: { className: styles.backdrop },
        slotProps: slotProps?.backdrop,
        ownerState,
    });
    const headerProps = resolveSlotProps<QuickLookOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const actionsProps = resolveSlotProps<QuickLookOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });
    const previewProps = resolveSlotProps<QuickLookOwnerState, "div", "div">({
        ownProps: { className: styles.preview },
        slotProps: slotProps?.preview,
        ownerState,
    });
    const footerProps = resolveSlotProps<QuickLookOwnerState, "div", "div">({
        ownProps: { className: styles.footer },
        slotProps: slotProps?.footer,
        ownerState,
    });

    return (
        <>
            <span ref={anchorRef} hidden />
            <BaseDialog.Root open={open && item != null} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
                <BaseDialog.Portal container={container}>
                    <FieldContextReset>
                        <BaseDialog.Backdrop {...backdropProps} />
                        <BaseDialog.Viewport className={styles.viewport}>
                            <BaseDialog.Popup
                                {...restProps}
                                ref={(element: HTMLDivElement | null) => {
                                    popupRef.current = element;
                                    if (typeof ref === "function") {
                                        ref(element);
                                    } else if (ref != null) {
                                        ref.current = element;
                                    }
                                }}
                                initialFocus={popupRef}
                                onKeyDown={handleKeyDown}
                                data-first={ownerState.first ? "" : undefined}
                                data-last={ownerState.last ? "" : undefined}
                                className={clsx(styles.root, className)}
                            >
                                {item != null && (
                                    <>
                                        <div {...headerProps}>
                                            <div className={styles.headings}>
                                                <BaseDialog.Title className={styles.title}>{item.title}</BaseDialog.Title>
                                                {item.description != null && (
                                                    <BaseDialog.Description className={styles.description}>{item.description}</BaseDialog.Description>
                                                )}
                                            </div>
                                            {actions != null && <div {...actionsProps}>{actions}</div>}
                                            <BaseDialog.Close
                                                render={
                                                    <IconButton variant="text" color="secondary" aria-label={labels.close}>
                                                        <Icon name="x" />
                                                    </IconButton>
                                                }
                                            />
                                        </div>
                                        <div className={styles.body}>
                                            <IconButton
                                                variant="text"
                                                color="secondary"
                                                aria-label={labels.previous}
                                                disabled={ownerState.first}
                                                onClick={() => step(-1)}
                                            >
                                                <Icon name="chev-l" />
                                            </IconButton>
                                            <div {...previewProps}>
                                                {renderPreview != null ? renderPreview(item) : <img src={item.src} alt={item.alt ?? item.title} />}
                                            </div>
                                            <IconButton
                                                variant="text"
                                                color="secondary"
                                                aria-label={labels.next}
                                                disabled={ownerState.last}
                                                onClick={() => step(1)}
                                            >
                                                <Icon name="chev-r" />
                                            </IconButton>
                                        </div>
                                        <div {...footerProps}>
                                            <span className={styles.position}>{labels.position(index, items.length)}</span>
                                            <span className={styles.hint}>
                                                <KeyboardShortcut>{labels.previousKey}</KeyboardShortcut>
                                                <KeyboardShortcut>{labels.nextKey}</KeyboardShortcut>
                                                {labels.browse}
                                            </span>
                                            <span className={styles.hint}>
                                                <KeyboardShortcut>{labels.closeKey}</KeyboardShortcut>
                                                {labels.close}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </BaseDialog.Popup>
                        </BaseDialog.Viewport>
                    </FieldContextReset>
                </BaseDialog.Portal>
            </BaseDialog.Root>
        </>
    );
});
