import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useId, useMemo } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Checkbox } from "../checkbox/Checkbox";
import type { FieldState } from "../field/Field";
import { useGroupMessage } from "../field/groupMessage";
import styles from "./CheckboxGroup.module.scss";
import { optionCheckState, toggleOption } from "./checkboxGroupSelection";

type CheckboxGroupOrientation = "vertical" | "horizontal";

/** One option of `CheckboxGroup`. An option with `children` is a group of options. */
export interface CheckboxGroupOption<Value extends string = string> {
    /** Identifies the option; `value` and `onChange` use it. A group's own value only identifies it and is never part of `value`. */
    value: Value;
    /** The visible label. */
    label: ReactNode;
    /** A second line under the label, e.g. an identifier or what the option does. */
    description?: ReactNode;
    /** Prevents changing this option, or – for a group – all options inside it. */
    disabled?: boolean;
    /** The options inside this group, shown indented below it. Its checkbox selects or clears all of them. */
    children?: ReadonlyArray<CheckboxGroupOption<Value>>;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CheckboxGroupOwnerState = {
    orientation: CheckboxGroupOrientation;
    state: FieldState;
    required: boolean;
    disabled: boolean;
    selectableGroups: boolean;
};

export interface CheckboxGroupSlotProps {
    /** Props for the `label` slot, the group's label above the options. */
    label?: SlotPropsValue<CheckboxGroupOwnerState, "span">;
    /** Props for the `group` slot, the element that holds the options and the group's role. */
    group?: SlotPropsValue<CheckboxGroupOwnerState, "div">;
    /** Props for the `nested` slot, the indented options of each group option. */
    nested?: SlotPropsValue<CheckboxGroupOwnerState, "div">;
    /** Props for the `groupHeading` slot, a group's label while `selectableGroups` is `false`. */
    groupHeading?: SlotPropsValue<CheckboxGroupOwnerState, "span">;
    /** Props for the `optionDescription` slot. */
    optionDescription?: SlotPropsValue<CheckboxGroupOwnerState, "span">;
    /** Props for the `message` slot, the help or validation message below the options. */
    message?: SlotPropsValue<CheckboxGroupOwnerState, "div">;
}

export interface CheckboxGroupProps<Value extends string = string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    "className" | "children" | "onChange" | "defaultValue"
> {
    /** The options. Give an option `children` to group options, e.g. the languages of a domain, as deep as needed. */
    options: ReadonlyArray<CheckboxGroupOption<Value>>;
    /** The values of the checked options, in the options' order. */
    value: ReadonlyArray<Value>;
    /** Called with the values of the checked options after one was toggled. */
    onChange: (value: Value[]) => void;
    /** Visible label above the options. */
    label?: ReactNode;
    /** The accessible name when there is no visible label. Required without `label`. */
    "aria-label"?: string;
    /** Identifies the field when a form is submitted. */
    name?: string;
    /** Adds a checkbox above the options that selects or clears all of them, with this label. */
    selectAllLabel?: ReactNode;
    /**
     * Gives each group a checkbox that selects or clears all options inside it. Without, a group's label is a heading.
     *
     * @defaultValue `true`
     */
    selectableGroups?: boolean;
    /**
     * Stacks the options or puts them side by side, wrapping when the space runs out. Groups always stack their options.
     *
     * @defaultValue `"vertical"`
     */
    orientation?: CheckboxGroupOrientation;
    /**
     * Marks the group as needing at least one checked option with a star after the label. The form validates it, e.g. through
     * `CheckboxGroupField`'s `required`.
     *
     * @defaultValue `false`
     */
    required?: boolean;
    /**
     * Prevents interaction with the whole group.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Permanent help below the options. */
    helperText?: ReactNode;
    /** Message for the `state`. Replaces the help while the state is `success`, `warning`, or `error`. Say what is missing and how to fix it. */
    validationMessage?: ReactNode;
    /**
     * Validation state, shown by the message color and, for `error`, the unchecked boxes' line.
     *
     * @defaultValue `"default"`
     */
    state?: FieldState;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CheckboxGroupSlotProps;
}

/**
 * Chooses any number of options, all visible at once, optionally grouped in a hierarchy, e.g. the domains and languages of content scopes.
 */
export const CheckboxGroup = forwardRef(function CheckboxGroup<Value extends string = string>(
    {
        options,
        value,
        onChange,
        label,
        "aria-label": ariaLabel,
        "aria-describedby": ariaDescribedBy,
        name,
        selectAllLabel,
        selectableGroups = true,
        orientation = "vertical",
        required = false,
        disabled = false,
        helperText,
        validationMessage,
        state = "default",
        className,
        slotProps,
        ...restProps
    }: CheckboxGroupProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const ownerState: CheckboxGroupOwnerState = { orientation, state, required, disabled, selectableGroups };
    const message = useGroupMessage({ state, validationMessage, helperText, ariaDescribedBy });
    const idPrefix = useId();
    const selected = useMemo(() => new Set(value), [value]);
    const controlState = state === "error" ? "error" : "default";
    const allOptions = useMemo<CheckboxGroupOption<Value>>(
        () => ({ value: "" as Value, label: selectAllLabel, children: options }),
        [options, selectAllLabel],
    );

    const labelProps = resolveSlotProps<CheckboxGroupOwnerState, "span", "span">({
        ownProps: { className: styles.label, id: message.labelId },
        slotProps: slotProps?.label,
        ownerState,
    });
    const groupProps = resolveSlotProps<CheckboxGroupOwnerState, "div", "div">({
        ownProps: {
            className: styles.group,
            role: "group",
            "aria-label": ariaLabel,
            "aria-labelledby": label != null ? message.labelId : undefined,
            "aria-describedby": message["aria-describedby"],
            "aria-invalid": message["aria-invalid"],
        },
        slotProps: slotProps?.group,
        ownerState,
    });
    const messageProps = resolveSlotProps<CheckboxGroupOwnerState, "div", "div">({
        ownProps: { className: styles.message, id: message.messageId },
        slotProps: slotProps?.message,
        ownerState,
    });

    const renderLabel = (option: CheckboxGroupOption<Value>) => {
        if (option.description == null) {
            return option.label;
        }
        const descriptionProps = resolveSlotProps<CheckboxGroupOwnerState, "span", "span">({
            ownProps: { className: styles.optionDescription },
            slotProps: slotProps?.optionDescription,
            ownerState,
        });
        return (
            <>
                {option.label}
                <span {...descriptionProps}>{option.description}</span>
            </>
        );
    };

    const renderOption = (option: CheckboxGroupOption<Value>, path: string, parentDisabled: boolean): ReactNode => {
        const optionDisabled = disabled || parentDisabled || option.disabled === true;
        const children = option.children ?? [];
        const { checked, indeterminate } = optionCheckState(option, selected);
        const headingId = `${idPrefix}${path}heading`;
        const checkbox =
            children.length > 0 && !selectableGroups ? null : (
                <Checkbox
                    checked={checked}
                    indeterminate={indeterminate}
                    disabled={optionDisabled}
                    state={controlState}
                    name={children.length > 0 ? undefined : name}
                    value={children.length > 0 ? undefined : option.value}
                    onChange={() => onChange(toggleOption(options, value, option))}
                    slotProps={{
                        row: { className: styles.optionRow },
                        control: { className: styles.optionControl },
                        label: children.length > 0 ? { id: headingId } : undefined,
                    }}
                >
                    {renderLabel(option)}
                </Checkbox>
            );
        if (children.length === 0) {
            return <div key={option.value}>{checkbox}</div>;
        }
        const headingProps = resolveSlotProps<CheckboxGroupOwnerState, "span", "span">({
            ownProps: { className: styles.groupHeading, id: headingId },
            slotProps: slotProps?.groupHeading,
            ownerState,
        });
        const nestedProps = resolveSlotProps<CheckboxGroupOwnerState, "div", "div">({
            ownProps: {
                className: styles.nested,
                role: "group",
                "aria-labelledby": headingId,
            },
            slotProps: slotProps?.nested,
            ownerState,
        });
        return (
            <div key={option.value} className={styles.branch}>
                {checkbox ?? <span {...headingProps}>{renderLabel(option)}</span>}
                <div {...nestedProps}>{children.map((child, index) => renderOption(child, `${path}-${index}`, optionDisabled))}</div>
            </div>
        );
    };

    return (
        <div
            {...restProps}
            ref={ref}
            data-orientation={ownerState.orientation}
            data-state={ownerState.state}
            data-required={ownerState.required ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-selectablegroups={ownerState.selectableGroups ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            {label != null && (
                <div className={styles.labelRow}>
                    <span {...labelProps}>{label}</span>
                    {required && <span className={styles.required} aria-hidden />}
                </div>
            )}
            <div {...groupProps}>
                {selectAllLabel != null && (
                    <div className={styles.selectAll}>
                        <Checkbox
                            {...optionCheckState(allOptions, selected)}
                            disabled={disabled}
                            state={controlState}
                            onChange={() => onChange(toggleOption(options, value, allOptions))}
                        >
                            {selectAllLabel}
                        </Checkbox>
                    </div>
                )}
                {options.map((option, index) => renderOption(option, String(index), false))}
            </div>
            {message.showsMessage && <div {...messageProps}>{message.message}</div>}
        </div>
    );
}) as <Value extends string = string>(props: CheckboxGroupProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
