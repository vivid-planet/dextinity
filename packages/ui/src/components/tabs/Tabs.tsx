import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import type { BaseUIEvent } from "@base-ui/react/types";
import { clsx } from "clsx";
import {
    type ComponentPropsWithoutRef,
    type ElementType,
    type ForwardedRef,
    forwardRef,
    type MouseEvent,
    type ReactNode,
    type RefAttributes,
} from "react";

import { isModifiedClick } from "../../utils/modifiedClick";
import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Icon } from "../icon/Icon";
import styles from "./Tabs.module.scss";

type TabsItemTone = "default" | "error";

export interface TabsLabels {
    /** Added to the accessible name of a tab with `tone="error"`. */
    error: string;
}

const defaultLabels: TabsLabels = {
    error: "Contains errors",
};

/** One tab of `Tabs`. */
export interface TabsItem<Value extends string = string> {
    /** Identifies the tab; `value` and `onChange` use it. */
    value: Value;
    /** The tab's label, one short word or two. */
    label: ReactNode;
    /** A count after the label that asks for attention, e.g. open issues in that section. Hidden when unset. */
    count?: number;
    /** Prevents choosing this tab. */
    disabled?: boolean;
    /**
     * `error` marks a section with invalid fields, e.g. after a failed save, so the user finds them in a tab they can't see.
     *
     * @defaultValue `"default"`
     */
    tone?: TabsItemTone;
    /**
     * Makes the tab a link to this address, so it can be opened in a new tab and the section has its own URL. Choosing it still calls
     * `onChange`; render it as the router's link with `slots.tab`.
     */
    href?: string;
    /** The content shown while this tab is active. Leave it out to render the content yourself. */
    panel?: ReactNode;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type TabsOwnerState = {
    hasPanels: boolean;
};

export interface TabsSlots {
    /**
     * Element for the tabs with an `href`, e.g. a router's link component. It receives `href`, `className`, `role`, the ARIA attributes
     * of a tab, the event handlers, and `children`.
     *
     * @defaultValue `a`
     */
    tab?: ElementType;
}

export interface TabsSlotProps {
    /** Props for the `list` slot, which holds the tabs and the indicator. */
    list?: SlotPropsValue<TabsOwnerState, typeof BaseTabs.List>;
    /** Props for the `tab` slot, each tab's button, or its link with an `href`. */
    tab?: SlotPropsValue<TabsOwnerState, "button">;
    /** Props for the `errorMarker` slot, the icon on a tab with `tone="error"`. */
    errorMarker?: SlotPropsValue<TabsOwnerState, "span">;
    /** Props for the `count` slot. */
    count?: SlotPropsValue<TabsOwnerState, "span">;
    /** Props for the `indicator` slot, the line under the active tab. */
    indicator?: SlotPropsValue<TabsOwnerState, typeof BaseTabs.Indicator>;
    /** Props for the `panel` slot, the active item's `panel`. */
    panel?: SlotPropsValue<TabsOwnerState, typeof BaseTabs.Panel>;
}

export interface TabsProps<Value extends string = string> extends Omit<
    ComponentPropsWithoutRef<typeof BaseTabs.Root>,
    "className" | "children" | "value" | "defaultValue" | "onValueChange" | "onChange"
> {
    /** The tabs, for equal-ranking sections of one view. Not for the steps of a flow. */
    items: ReadonlyArray<TabsItem<Value>>;
    /** The active tab's value. */
    value: Value;
    /** Called with the value of the newly chosen tab. */
    onChange: (value: Value) => void;
    /** The accessible name of the tab list. */
    "aria-label": string;
    /** The built-in texts. */
    labels?: Partial<TabsLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Sets which element a named inner part renders as. */
    slots?: TabsSlots;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: TabsSlotProps;
}

/**
 * Switches between equal-ranking sections of one view, e.g. the content, SEO, and settings of a page.
 */
export const Tabs = forwardRef(function Tabs<Value extends string = string>(
    { items, value, onChange, "aria-label": ariaLabel, labels: labelsProp, className, slots, slotProps, ...restProps }: TabsProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const TabSlot: ElementType = slots?.tab ?? "a";
    const ownerState: TabsOwnerState = { hasPanels: items.some((item) => item.panel != null) };

    const listProps = resolveSlotProps<TabsOwnerState, typeof BaseTabs.List, typeof BaseTabs.List>({
        ownProps: { className: styles.list, "aria-label": ariaLabel },
        slotProps: slotProps?.list,
        ownerState,
    });
    const tabProps = resolveSlotProps<TabsOwnerState, "button", "button">({
        ownProps: { className: styles.tab },
        slotProps: slotProps?.tab,
        ownerState,
    });
    const errorMarkerProps = resolveSlotProps<TabsOwnerState, "span", "span">({
        ownProps: { className: styles.errorMarker },
        slotProps: slotProps?.errorMarker,
        ownerState,
    });
    const countProps = resolveSlotProps<TabsOwnerState, "span", "span">({
        ownProps: { className: styles.count },
        slotProps: slotProps?.count,
        ownerState,
    });
    const indicatorProps = resolveSlotProps<TabsOwnerState, typeof BaseTabs.Indicator, typeof BaseTabs.Indicator>({
        ownProps: { className: styles.indicator },
        slotProps: slotProps?.indicator,
        ownerState,
    });
    const panelProps = resolveSlotProps<TabsOwnerState, typeof BaseTabs.Panel, "div">({
        ownProps: { className: styles.panel },
        slotProps: slotProps?.panel,
        ownerState,
    });

    return (
        <BaseTabs.Root
            {...restProps}
            ref={ref}
            value={value}
            onValueChange={(nextValue: Value) => onChange(nextValue)}
            data-haspanels={ownerState.hasPanels ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <BaseTabs.List {...listProps}>
                {items.map((item) => (
                    <BaseTabs.Tab
                        key={item.value}
                        {...tabProps}
                        value={item.value}
                        disabled={item.disabled}
                        data-tone={item.tone ?? "default"}
                        {...(item.href != null && {
                            nativeButton: false,
                            render: <TabSlot href={item.href} />,
                            onClick: (event: BaseUIEvent<MouseEvent<HTMLElement>>) => {
                                tabProps.onClick?.(event as BaseUIEvent<MouseEvent<HTMLButtonElement>>);
                                if (item.disabled) {
                                    event.preventDefault();
                                } else if (isModifiedClick(event)) {
                                    // The browser opens the link elsewhere, so the tab stays where it is
                                    event.preventBaseUIHandler();
                                }
                            },
                        })}
                    >
                        {item.label}
                        {item.tone === "error" && (
                            <>
                                {" "}
                                <span {...errorMarkerProps}>
                                    <Icon name="alert" />
                                    <span className={styles.visuallyHidden}>{labels.error}</span>
                                </span>
                            </>
                        )}
                        {item.count != null && (
                            <>
                                {" "}
                                <span {...countProps}>{item.count}</span>
                            </>
                        )}
                    </BaseTabs.Tab>
                ))}
                <BaseTabs.Indicator {...indicatorProps} />
            </BaseTabs.List>
            {items.map(
                (item) =>
                    item.panel != null && (
                        <BaseTabs.Panel key={item.value} {...panelProps} value={item.value}>
                            {item.panel}
                        </BaseTabs.Panel>
                    ),
            )}
        </BaseTabs.Root>
    );
}) as <Value extends string = string>(props: TabsProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
