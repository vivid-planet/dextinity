import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import styles from "./EditLayout.module.scss";

type EditLayoutVariant = "page" | "form" | "formWithPreview" | "formWithBlocks";
type EditLayoutPane = "editor" | "preview";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type EditLayoutOwnerState = {
    variant: EditLayoutVariant;
    /** The pane shown in narrow layouts, where the preview and the editor don't fit next to each other. */
    pane: EditLayoutPane;
    /** Whether the page has a preview. */
    preview: boolean;
    /** Whether the form has a side column. */
    aside: boolean;
};

export interface EditLayoutSlotProps {
    /** Props for the `header` slot. */
    header?: SlotPropsValue<EditLayoutOwnerState, "div">;
    /** Props for the `paneSwitch` slot. */
    paneSwitch?: SlotPropsValue<EditLayoutOwnerState, "div">;
    /** Props for the `body` slot, which holds the panes. */
    body?: SlotPropsValue<EditLayoutOwnerState, "div">;
    /** Props for the `editor` slot. */
    editor?: SlotPropsValue<EditLayoutOwnerState, "div">;
    /** Props for the `preview` slot. */
    preview?: SlotPropsValue<EditLayoutOwnerState, "div">;
    /** Props for the `aside` slot. */
    aside?: SlotPropsValue<EditLayoutOwnerState, "aside">;
}

export interface EditLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children"> {
    /**
     * How the editor and the preview share the page:
     *
     * - `page`: a page with blocks — the preview on the left, the editor panel with the tabs Blocks, SEO, and Settings on the right.
     * - `form`: structured content — the fields in sections, optionally with a side column.
     * - `formWithPreview`: the fields on the left, the preview on the right.
     * - `formWithBlocks`: the preview on the left, the fields and blocks on the right.
     *
     * @defaultValue `"form"`
     */
    variant?: EditLayoutVariant;
    /** Back link, kind and scope, title, and status, e.g. a `PageHeader`. Saving stays the only primary action. */
    header: ReactNode;
    /** The editor: the panel with the blocks, or the fields in sections. */
    children: ReactNode;
    /** The preview, e.g. a `DevicePreview`. Shown in all variants but `form`; it fills the viewport's height and stays in view. */
    preview?: ReactNode;
    /** The side column of a `form`, e.g. status and the danger zone. Stays in view while the form scrolls. */
    aside?: ReactNode;
    /** The accessible name of the side column. */
    asideLabel?: string;
    /** Switches between the editor and the preview in narrow layouts, e.g. a `SegmentedControl` bound to `pane`; hidden otherwise. */
    paneSwitch?: ReactNode;
    /**
     * The pane shown in narrow layouts, where only one of editor and preview fits.
     *
     * @defaultValue `"editor"`
     */
    pane?: EditLayoutPane;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: EditLayoutSlotProps;
}

/**
 * The layout of an edit page: the header, then the editor next to a preview of the result. Pages always have the preview on the left and
 * the blocks on the right; structured content uses one of the three form variants.
 */
export const EditLayout = forwardRef<HTMLDivElement, EditLayoutProps>(function EditLayout(
    { variant = "form", header, children, preview, aside, asideLabel, paneSwitch, pane = "editor", className, slotProps, ...restProps },
    ref,
) {
    const showsPreview = variant !== "form" && preview != null;
    const showsAside = variant === "form" && aside != null;
    const ownerState: EditLayoutOwnerState = { variant, pane, preview: showsPreview, aside: showsAside };

    const headerProps = resolveSlotProps<EditLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.header },
        slotProps: slotProps?.header,
        ownerState,
    });
    const paneSwitchProps = resolveSlotProps<EditLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.paneSwitch },
        slotProps: slotProps?.paneSwitch,
        ownerState,
    });
    const bodyProps = resolveSlotProps<EditLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.body },
        slotProps: slotProps?.body,
        ownerState,
    });
    const editorProps = resolveSlotProps<EditLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.editor },
        slotProps: slotProps?.editor,
        ownerState,
    });
    const previewProps = resolveSlotProps<EditLayoutOwnerState, "div", "div">({
        ownProps: { className: styles.preview },
        slotProps: slotProps?.preview,
        ownerState,
    });
    const asideProps = resolveSlotProps<EditLayoutOwnerState, "aside", "aside">({
        ownProps: { className: styles.aside, "aria-label": asideLabel },
        slotProps: slotProps?.aside,
        ownerState,
    });

    return (
        <div
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-pane={ownerState.pane}
            data-preview={ownerState.preview ? "" : undefined}
            data-aside={ownerState.aside ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headerProps}>{header}</div>
            {showsPreview && paneSwitch != null && <div {...paneSwitchProps}>{paneSwitch}</div>}
            <div {...bodyProps}>
                {showsPreview && variant !== "formWithPreview" && <div {...previewProps}>{preview}</div>}
                <div {...editorProps}>{children}</div>
                {showsPreview && variant === "formWithPreview" && <div {...previewProps}>{preview}</div>}
                {showsAside && <aside {...asideProps}>{aside}</aside>}
            </div>
        </div>
    );
});
