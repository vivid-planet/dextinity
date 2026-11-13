import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import {
    type ForwardedRef,
    forwardRef,
    type ForwardRefExoticComponent,
    type HTMLAttributes,
    type ReactNode,
    type RefAttributes,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { type ControlAriaProps, useGroupControl } from "../field/ControlFrame";
import { Icon } from "../icon/Icon";
import { Menu } from "../menu/Menu";
import { MenuRadioGroup } from "../menu/MenuRadioGroup";
import { MenuRadioItem } from "../menu/MenuRadioItem";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./SegmentedControl.module.scss";

type SegmentedControlSize = "default" | "small";

type GroupSlot = ForwardRefExoticComponent<Omit<RadioGroup.Props, "value" | "defaultValue" | "onValueChange"> & RefAttributes<HTMLDivElement>>;

type OptionSlot = ForwardRefExoticComponent<Omit<Radio.Root.Props, "value"> & RefAttributes<HTMLSpanElement>>;

type SegmentedControlOverflow = "menu" | "wrap";

/** One option of `SegmentedControl`. */
export interface SegmentedControlOption<Value extends string = string> {
    /** Identifies the option; `value` and `onChange` use it. */
    value: Value;
    /** The visible text. Leave it out for an icon-only option and set `aria-label` instead. */
    label?: ReactNode;
    /** An icon before the label, or the whole content of an icon-only option. */
    icon?: ReactNode;
    /** The accessible name of an icon-only option, also shown as its tooltip. */
    "aria-label"?: string;
    /** The option as plain text, for the menu shown when the options don't fit. Required when `label` isn't a string and there's no `aria-label`. */
    textValue?: string;
    /** Prevents choosing this option. */
    disabled?: boolean;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SegmentedControlOwnerState = {
    size: SegmentedControlSize;
    disabled: boolean;
    invalid: boolean;
    /** Whether the options don't fit and a menu shows them instead. */
    collapsed: boolean;
};

export interface SegmentedControlSlotProps {
    /** Props for the `group` slot, the track that holds the options and the radio group's role. */
    group?: SlotPropsValue<SegmentedControlOwnerState, GroupSlot>;
    /** Props for the `option` slot, each option's radio. */
    option?: SlotPropsValue<SegmentedControlOwnerState, OptionSlot>;
    /** Props for the `optionIcon` slot. */
    optionIcon?: SlotPropsValue<SegmentedControlOwnerState, "span">;
    /** Props for the `menuTrigger` slot, the button that opens the menu of options when they don't fit. */
    menuTrigger?: SlotPropsValue<SegmentedControlOwnerState, "button">;
}

export interface SegmentedControlProps<Value extends string = string>
    extends ControlAriaProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange" | "defaultValue" | keyof ControlAriaProps> {
    /** Two to four mutually exclusive options. For more, use a `Select`. */
    options: ReadonlyArray<SegmentedControlOption<Value>>;
    /** The chosen option's value. */
    value: Value;
    /** Called with the newly chosen option's value. */
    onChange: (value: Value) => void;
    /**
     * `small` for toolbars, e.g. a device switch above a preview.
     *
     * @defaultValue `"default"`
     */
    size?: SegmentedControlSize;
    /**
     * What happens when the options don't fit in one row: `menu` shows the chosen option with a menu of all options, `wrap` wraps the options
     * onto more rows.
     *
     * @defaultValue `"menu"`
     */
    overflow?: SegmentedControlOverflow;
    /**
     * Prevents interaction with the whole group. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: SegmentedControlSlotProps;
}

function optionText(option: SegmentedControlOption<string>): string {
    if (typeof option.label === "string" || typeof option.label === "number") {
        return String(option.label);
    }
    return option.textValue ?? option["aria-label"] ?? "";
}

/**
 * Tells whether the options are wider than the space the control may take, also while the menu replaces them.
 */
function useOptionsOverflow(enabled: boolean) {
    const [overflows, setOverflows] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const groupRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const group = groupRef.current;
        if (!enabled || root == null || group == null) {
            setOverflows(false);
            return;
        }
        const measure = () => setOverflows(group.offsetWidth > root.clientWidth + 1);
        measure();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(measure);
        observer.observe(root);
        observer.observe(group);
        return () => observer.disconnect();
    }, [enabled]);

    return { overflows, rootRef, groupRef };
}

/**
 * Chooses one of two to four mutually exclusive options, e.g. a view or a device. When the options don't fit, a menu shows them instead.
 * On its own, e.g. in a toolbar, name it with `aria-label`; in a form, put it in a `Field` with `layout="group"`, whose label names it.
 */
export const SegmentedControl = forwardRef(function SegmentedControl<Value extends string = string>(
    {
        options,
        value,
        onChange,
        size = "default",
        overflow = "menu",
        disabled,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        className,
        slotProps,
        ...restProps
    }: SegmentedControlProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const { overflows, rootRef, groupRef } = useOptionsOverflow(overflow === "menu");
    const { control, nameId, hiddenLabel } = useGroupControl({
        disabled,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
    });
    const ownerState: SegmentedControlOwnerState = {
        size,
        disabled: control.disabled,
        invalid: control["aria-invalid"] === true,
        collapsed: overflows,
    };
    const [menuOpen, setMenuOpen] = useState(false);
    const valueId = `${useId()}value`;

    const setRootRef = useCallback(
        (element: HTMLDivElement | null) => {
            rootRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        },
        [ref, rootRef],
    );

    const groupProps = resolveSlotProps<SegmentedControlOwnerState, GroupSlot, GroupSlot>({
        ownProps: {
            className: styles.group,
            "aria-label": control["aria-label"],
            "aria-labelledby": control["aria-labelledby"],
            "aria-describedby": control["aria-describedby"],
            "aria-invalid": control["aria-invalid"],
            "aria-required": control["aria-required"],
        },
        slotProps: slotProps?.group,
        ownerState,
    });
    const iconProps = resolveSlotProps<SegmentedControlOwnerState, "span", "span">({
        ownProps: { className: styles.optionIcon },
        slotProps: slotProps?.optionIcon,
        ownerState,
    });
    const menuTriggerProps = resolveSlotProps<SegmentedControlOwnerState, "button", "button">({
        ownProps: {
            type: "button",
            className: styles.menuTrigger,
            disabled: ownerState.disabled,
            "aria-labelledby": clsx(nameId, valueId),
            "aria-describedby": control["aria-describedby"],
            "aria-invalid": control["aria-invalid"],
        },
        slotProps: slotProps?.menuTrigger,
        ownerState,
    });

    const chosenOption = options.find((option) => option.value === value);

    return (
        <div
            {...restProps}
            ref={setRootRef}
            data-size={ownerState.size}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-invalid={ownerState.invalid ? "" : undefined}
            data-collapsed={ownerState.collapsed ? "" : undefined}
            data-overflow={overflow}
            className={clsx(styles.root, className)}
        >
            {ownerState.collapsed && (
                <>
                    {hiddenLabel}
                    <Menu
                        open={menuOpen}
                        onOpenChange={setMenuOpen}
                        disabled={ownerState.disabled}
                        trigger={
                            <button {...menuTriggerProps}>
                                <span id={valueId} className={styles.menuTriggerValue}>
                                    {chosenOption?.icon != null && <span {...iconProps}>{chosenOption.icon}</span>}
                                    {chosenOption != null && (chosenOption.label ?? chosenOption["aria-label"])}
                                </span>
                                <Icon name="chevron-down" className={styles.menuTriggerChevron} />
                            </button>
                        }
                    >
                        <MenuRadioGroup value={value} onChange={(next) => next !== value && onChange(next as Value)}>
                            {options.map((option) => (
                                <MenuRadioItem
                                    key={option.value}
                                    value={option.value}
                                    label={optionText(option)}
                                    icon={option.icon}
                                    disabled={option.disabled}
                                />
                            ))}
                        </MenuRadioGroup>
                    </Menu>
                </>
            )}
            <RadioGroup<Value>
                {...groupProps}
                ref={groupRef}
                value={value}
                onValueChange={(next) => {
                    if (next !== value) {
                        onChange(next);
                    }
                }}
                disabled={ownerState.disabled}
                aria-hidden={ownerState.collapsed ? true : undefined}
            >
                {options.map((option) => {
                    const isIconOnly = option.label == null;
                    const optionProps = resolveSlotProps<SegmentedControlOwnerState, OptionSlot, OptionSlot>({
                        ownProps: {
                            className: styles.option,
                            disabled: option.disabled,
                            "aria-label": option["aria-label"],
                        },
                        slotProps: slotProps?.option,
                        ownerState,
                    });
                    const radio = (
                        <Radio.Root key={option.value} {...optionProps} value={option.value}>
                            {option.icon != null && <span {...iconProps}>{option.icon}</span>}
                            {option.label}
                        </Radio.Root>
                    );
                    return isIconOnly && option["aria-label"] != null ? (
                        <Tooltip key={option.value} content={option["aria-label"]}>
                            {radio}
                        </Tooltip>
                    ) : (
                        radio
                    );
                })}
            </RadioGroup>
        </div>
    );
}) as <Value extends string = string>(props: SegmentedControlProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
