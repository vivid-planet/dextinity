import type { BaseUIEvent } from "@base-ui/react/types";
import { clsx } from "clsx";
import { type ChangeEvent, forwardRef, Fragment, type HTMLAttributes, type ReactElement, type ReactNode, useState } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";
import { IconButton, type IconButtonProps } from "../iconButton/IconButton";
import { Menu } from "../menu/Menu";
import { MenuItem } from "../menu/MenuItem";
import { MenuSeparator } from "../menu/MenuSeparator";
import { MenuSubmenu } from "../menu/MenuSubmenu";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./PageHeader.module.scss";

type PageHeaderVariant = "default" | "compact";

export interface PageHeaderBack {
    /** Where the back action leads, as its accessible name and tooltip, e.g. "Back to job ads". */
    label: string;
    /** The destination; makes the back action a link. Use the same destination as the breadcrumbs. */
    href?: string;
    /** Called when the back action is chosen, e.g. to navigate with the router. */
    onClick?: () => void;
    /**
     * Render the back action as a custom element, e.g. the router's link component.
     *
     * @example
     * ```tsx
     * back={{ label: "Back to job ads", render: <RouterLink to="/job-ads" /> }}
     * ```
     */
    render?: ReactElement;
}

/** An action of the page, shown as a button or, when the page has more than one secondary action, as an item of a menu. */
export interface PageHeaderAction {
    /** The action as a verb, e.g. "Save" or "New job ad". */
    label: string;
    /** Shown before the label. In windows narrower than 768 px, a button with an icon shows only the icon. */
    icon?: ReactNode;
    /** Called when the action is chosen. */
    onClick?: () => void;
    /** Makes the action a link to this URL. Only buttons can be links; in the menu, use `onClick`. */
    href?: string;
    disabled?: boolean;
    /** The keyboard shortcut, in the notation of `useKeyboardShortcut`, shown in the tooltip or the menu. It only shows the hint. */
    keyboardShortcut?: string;
    /** A tooltip for the button, e.g. what saving applies to. */
    tooltip?: string;
    /** `error` for a destructive action such as Delete, in the menu only. */
    color?: "error";
    /** Starts a new group in the menu with a separator. */
    separatorBefore?: boolean;
    /**
     * Menu items that open from this action, e.g. the folders to move to: a submenu in the menu, or, as the only secondary action, a
     * menu of its button.
     */
    submenu?: ReactNode;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type PageHeaderOwnerState = {
    variant: PageHeaderVariant;
    hasBack: boolean;
    hasActions: boolean;
    titleEditable: boolean;
};

export interface PageHeaderSlotProps {
    /** Props for the `heading` slot, the column with the label line, title, and subtitle. */
    heading?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the `labelLine` slot, the mono line above the title with the breadcrumbs and eyebrow. */
    labelLine?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the `title` slot. */
    title?: SlotPropsValue<PageHeaderOwnerState, "h1">;
    /** Props for the `titleInput` slot, the field inside the title when `onTitleChange` is set. */
    titleInput?: SlotPropsValue<PageHeaderOwnerState, "input">;
    /** Props for the `subtitle` slot, the line below the title with the status and the subtitle. */
    subtitle?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the `actions` slot. */
    actions?: SlotPropsValue<PageHeaderOwnerState, "div">;
    /** Props for the back action, e.g. its `tooltip`. */
    back?: Partial<Omit<IconButtonProps, "aria-label" | "render" | "nativeButton" | "role" | "children">>;
}

export interface PageHeaderLabels {
    /** The accessible name of the title field when the title is editable. */
    titleInput: string;
    /** The button that opens the menu of the secondary actions. */
    moreActions: string;
}

const defaultLabels: PageHeaderLabels = {
    titleInput: "Title",
    moreActions: "More",
};

export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "children" | "title"> {
    /** The display title. Exactly one per page. */
    title: string;
    /** Makes the title editable in place, e.g. the name of a file. Called with the new title on every change. */
    onTitleChange?: (title: string) => void;
    /**
     * `compact` for editors, where the content needs the room: a smaller title, a tighter label line, and the actions centered next to
     * the title.
     *
     * @defaultValue `"default"`
     */
    variant?: PageHeaderVariant;
    /** The label above the title, e.g. the scope or the area: "Austria · German · 23 pages". */
    eyebrow?: ReactNode;
    /** The state of the page's item before the subtitle, e.g. `<StatusIndicator status="published" />` or a `Badge`. */
    status?: ReactNode;
    /** More information below the title, e.g. numbers: "3 unpublished · 1 archived". */
    subtitle?: ReactNode;
    /** The page's main action, as a contained button, e.g. "Save" or "New job ad". */
    primaryAction?: PageHeaderAction;
    /**
     * The page's other actions. One is an outlined button next to the primary action; more open from one button as a menu, so that the
     * header never shows more than two buttons.
     */
    secondaryActions?: readonly PageHeaderAction[];
    /** A state that belongs to the actions, before them, e.g. `<SaveState />` on edit pages. */
    actionStatus?: ReactNode;
    /** A back action at the start of the label line above the title, for edit pages and subpages, e.g. to the list the edited item belongs to. */
    back?: PageHeaderBack;
    /** Breadcrumbs in the label line, e.g. `<Breadcrumbs variant="label" />`, before the eyebrow. */
    breadcrumbs?: ReactNode;
    /** The built-in texts. */
    labels?: Partial<PageHeaderLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: PageHeaderSlotProps;
}

const labelSeparator = "·";

function ActionButton({ action, primary }: { action: PageHeaderAction; primary?: boolean }) {
    const button = (
        <Button
            variant={primary ? "contained" : "outlined"}
            color={primary ? "primary" : "secondary"}
            startIcon={action.icon}
            href={action.href}
            disabled={action.disabled}
            onClick={action.onClick}
            className={styles.action}
            data-has-icon={action.icon != null ? "" : undefined}
        >
            <span className={styles.actionLabel}>{action.label}</span>
        </Button>
    );
    if (action.tooltip == null && action.keyboardShortcut == null) {
        return button;
    }
    return (
        <Tooltip content={action.tooltip ?? action.label} keyboardShortcut={action.keyboardShortcut}>
            {button}
        </Tooltip>
    );
}

/** A secondary action with a submenu, on its own: its button opens the submenu's items as a menu. */
function SubmenuButton({ action }: { action: PageHeaderAction }) {
    const [open, setOpen] = useState(false);
    return (
        <Menu
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            disabled={action.disabled}
            trigger={
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={action.icon}
                    endIcon={<Icon name="chevron-down" />}
                    disabled={action.disabled}
                    className={clsx(styles.action, styles.submenuButton)}
                    data-has-icon={action.icon != null ? "" : undefined}
                >
                    <span className={styles.actionLabel}>{action.label}</span>
                </Button>
            }
        >
            {action.submenu}
        </Menu>
    );
}

function ActionsMenu({ actions, label }: { actions: readonly PageHeaderAction[]; label: string }) {
    const [open, setOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    return (
        <Menu
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                if (!nextOpen) {
                    setOpenSubmenu(null);
                }
            }}
            placement="bottom-end"
            trigger={
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<Icon name="more-horizontal" />}
                    endIcon={<Icon name="chevron-down" />}
                    className={clsx(styles.action, styles.moreButton)}
                    data-has-icon=""
                >
                    <span className={styles.actionLabel}>{label}</span>
                </Button>
            }
        >
            {actions.map((action) => (
                <Fragment key={action.label}>
                    {action.separatorBefore && <MenuSeparator />}
                    {action.submenu != null ? (
                        <MenuSubmenu
                            label={action.label}
                            icon={action.icon}
                            disabled={action.disabled}
                            open={openSubmenu === action.label}
                            onOpenChange={(submenuOpen) => setOpenSubmenu(submenuOpen ? action.label : null)}
                        >
                            {action.submenu}
                        </MenuSubmenu>
                    ) : (
                        <MenuItem
                            label={action.label}
                            icon={action.icon}
                            color={action.color}
                            disabled={action.disabled}
                            keyboardShortcut={action.keyboardShortcut}
                            onClick={action.onClick}
                        />
                    )}
                </Fragment>
            ))}
        </Menu>
    );
}

/**
 * The head of every page: a mono label line for context, the display title, the status and more information, and the page's actions:
 * at most one primary and one secondary button. More secondary actions open from the secondary button as a menu. In windows narrower
 * than 768 px it takes less height: a smaller title, no eyebrow (the top bar shows the scope), and the actions next to the title, where
 * buttons with an icon show only the icon.
 */
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
    {
        title,
        onTitleChange,
        variant = "default",
        eyebrow,
        status,
        subtitle,
        primaryAction,
        secondaryActions = [],
        actionStatus,
        back,
        breadcrumbs,
        labels: labelsProp,
        className,
        slotProps,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const hasActions = primaryAction != null || secondaryActions.length > 0 || actionStatus != null;
    // `false` and empty text render nothing, e.g. from `status={archived && <StatusIndicator … />}`, so they don't count as a status
    const hasStatus = status != null && status !== false && status !== "";
    const ownerState: PageHeaderOwnerState = { variant, hasBack: back != null, hasActions, titleEditable: onTitleChange != null };

    const headingProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.heading },
        slotProps: slotProps?.heading,
        ownerState,
    });
    const labelLineProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.labelLine },
        slotProps: slotProps?.labelLine,
        ownerState,
    });
    const titleProps = resolveSlotProps<PageHeaderOwnerState, "h1", "h1">({
        ownProps: { className: styles.title },
        slotProps: slotProps?.title,
        ownerState,
    });
    const titleInputProps = resolveSlotProps<PageHeaderOwnerState, "input", "input">({
        ownProps: { className: styles.titleInput },
        slotProps: slotProps?.titleInput,
        ownerState,
    });
    const subtitleProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.subtitle },
        slotProps: slotProps?.subtitle,
        ownerState,
    });
    const actionsProps = resolveSlotProps<PageHeaderOwnerState, "div", "div">({
        ownProps: { className: styles.actions },
        slotProps: slotProps?.actions,
        ownerState,
    });

    const isBackLink = back != null && (back.href != null || back.render != null);

    return (
        <header
            {...restProps}
            ref={ref}
            data-variant={ownerState.variant}
            data-has-back={ownerState.hasBack ? "" : undefined}
            data-has-actions={ownerState.hasActions ? "" : undefined}
            data-title-editable={ownerState.titleEditable ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...headingProps}>
                {(back != null || breadcrumbs != null || eyebrow != null) && (
                    <div {...labelLineProps}>
                        {back != null && (
                            <IconButton
                                variant="text"
                                color="secondary"
                                size="small"
                                {...slotProps?.back}
                                className={clsx(styles.back, slotProps?.back?.className)}
                                aria-label={back.label}
                                nativeButton={!isBackLink}
                                // Base UI gives every non-native button `role="button"`; unset, the back link keeps its link role
                                role={undefined}
                                render={back.render ?? (back.href != null ? <a href={back.href} /> : undefined)}
                                onClick={(event) => {
                                    slotProps?.back?.onClick?.(event);
                                    if (back.onClick != null) {
                                        event.preventDefault();
                                        back.onClick();
                                    }
                                }}
                            >
                                <Icon name="arrow-left" />
                            </IconButton>
                        )}
                        {breadcrumbs != null && <div>{breadcrumbs}</div>}
                        {breadcrumbs != null && eyebrow != null && (
                            <span className={styles.separator} aria-hidden>
                                {labelSeparator}
                            </span>
                        )}
                        {eyebrow != null && <span className={styles.eyebrow}>{eyebrow}</span>}
                    </div>
                )}
                <h1 {...titleProps}>
                    {onTitleChange != null ? (
                        <input
                            aria-label={labels.titleInput}
                            {...titleInputProps}
                            value={title}
                            onChange={(event) => {
                                titleInputProps.onChange?.(event as BaseUIEvent<ChangeEvent<HTMLInputElement>>);
                                onTitleChange(event.target.value);
                            }}
                        />
                    ) : (
                        title
                    )}
                </h1>
                {(hasStatus || subtitle != null) && (
                    <div {...subtitleProps}>
                        {hasStatus && <span className={styles.status}>{status}</span>}
                        {subtitle}
                    </div>
                )}
            </div>
            {hasActions && (
                <div {...actionsProps}>
                    {actionStatus != null && <div className={styles.actionStatus}>{actionStatus}</div>}
                    {(primaryAction != null || secondaryActions.length > 0) && (
                        <div className={styles.buttons}>
                            {secondaryActions.length === 1 &&
                                (secondaryActions[0].submenu != null ? (
                                    <SubmenuButton action={secondaryActions[0]} />
                                ) : (
                                    <ActionButton action={secondaryActions[0]} />
                                ))}
                            {secondaryActions.length > 1 && <ActionsMenu actions={secondaryActions} label={labels.moreActions} />}
                            {primaryAction != null && <ActionButton action={primaryAction} primary />}
                        </div>
                    )}
                </div>
            )}
        </header>
    );
});
