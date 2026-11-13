import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useId, useMemo } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Checkbox } from "../checkbox/Checkbox";
import { type ControlAriaProps, useGroupControl } from "../field/ControlFrame";
import { FieldContextReset } from "../field/fieldContext";
import styles from "./CheckboxGroup.module.scss";
import { optionCheckState, optionValues, toggleOption } from "./checkboxGroupSelection";

type CheckboxGroupOrientation = "vertical" | "horizontal";

/** One option of `CheckboxGroup`. An option with `children` is a group of options. */
export interface CheckboxGroupOption<Value extends string = string> {
    /** Identifies the option; `value` and `onChange` use it. A group's own value only identifies it and is never part of `value`. */
    value: Value;
    /** The visible label. */
    label: ReactNode;
    /** A second line under the label, e.g. an identifier or what the option does. */
    description?: ReactNode;
    /** Prevents changing this option, or – for a group – all options inside it. A group whose options are all disabled is disabled too. */
    disabled?: boolean;
    /** The options inside this group, shown indented below it. Its checkbox selects or clears all of them. */
    children?: ReadonlyArray<CheckboxGroupOption<Value>>;
}

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type CheckboxGroupOwnerState = {
    orientation: CheckboxGroupOrientation;
    invalid: boolean;
    required: boolean;
    disabled: boolean;
    readOnly: boolean;
    selectableGroups: boolean;
};

export interface CheckboxGroupSlotProps {
    /** Props for the `group` slot, the element that holds the options and the group's role. */
    group?: SlotPropsValue<CheckboxGroupOwnerState, "div">;
    /** Props for the `nested` slot, the indented options of each group option. */
    nested?: SlotPropsValue<CheckboxGroupOwnerState, "div">;
    /** Props for the `groupHeading` slot, a group's label while `selectableGroups` is `false`. */
    groupHeading?: SlotPropsValue<CheckboxGroupOwnerState, "span">;
    /** Props for the `optionDescription` slot. */
    optionDescription?: SlotPropsValue<CheckboxGroupOwnerState, "span">;
}

export interface CheckboxGroupProps<Value extends string = string>
    extends ControlAriaProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange" | "defaultValue" | keyof ControlAriaProps> {
    /** The options. Give an option `children` to group options, e.g. the languages of a domain, as deep as needed. */
    options: ReadonlyArray<CheckboxGroupOption<Value>>;
    /** The values of the checked options, in the options' order. */
    value: ReadonlyArray<Value>;
    /** Called with the values of the checked options after one was toggled. */
    onChange: (value: Value[]) => void;
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
     * Prevents interaction with the whole group. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the checked options without letting the user change them. Ignored inside a `Field`, which takes it from its own `readOnly`.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: CheckboxGroupSlotProps;
}

/**
 * Chooses any number of options, all visible at once, optionally grouped in a hierarchy, e.g. the domains and languages of content scopes.
 * Put it in a `Field` with `layout="group"` for a label, help, and a validation message: the field's label names the group. On its own,
 * name it with `aria-label`.
 */
export const CheckboxGroup = forwardRef(function CheckboxGroup<Value extends string = string>(
    {
        options,
        value,
        onChange,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
        name,
        selectAllLabel,
        selectableGroups = true,
        orientation = "vertical",
        disabled: disabledProp,
        readOnly: readOnlyProp,
        className,
        slotProps,
        ...restProps
    }: CheckboxGroupProps<Value>,
    ref: ForwardedRef<HTMLDivElement>,
) {
    const { control } = useGroupControl({
        controlName: "CheckboxGroup",
        describeRequired: true,
        disabled: disabledProp,
        readOnly: readOnlyProp,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        "aria-describedby": ariaDescribedBy,
        "aria-invalid": ariaInvalid,
    });
    const { disabled, readOnly } = control;
    const ownerState: CheckboxGroupOwnerState = {
        orientation,
        invalid: control["aria-invalid"] === true,
        required: control.required,
        disabled,
        readOnly,
        selectableGroups,
    };
    const idPrefix = useId();
    const selected = useMemo(() => new Set(value), [value]);
    const allOptions = useMemo<CheckboxGroupOption<Value>>(
        () => ({ value: "" as Value, label: selectAllLabel, children: options }),
        [options, selectAllLabel],
    );

    const groupProps = resolveSlotProps<CheckboxGroupOwnerState, "div", "div">({
        ownProps: {
            className: styles.group,
            role: "group",
            "aria-label": control["aria-label"],
            "aria-labelledby": control["aria-labelledby"],
            "aria-describedby": control["aria-describedby"],
            "aria-invalid": control["aria-invalid"],
        },
        slotProps: slotProps?.group,
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
        const checkboxDisabled = optionDisabled || (children.length > 0 && optionValues(option, true).length === 0);
        const { checked, indeterminate } = optionCheckState(option, selected);
        const headingId = `${idPrefix}${path}heading`;
        const checkbox =
            children.length > 0 && !selectableGroups ? null : (
                <Checkbox
                    checked={checked}
                    indeterminate={indeterminate}
                    disabled={checkboxDisabled}
                    readOnly={readOnly}
                    aria-invalid={ownerState.invalid}
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
            data-invalid={ownerState.invalid ? "" : undefined}
            data-required={ownerState.required ? "" : undefined}
            data-disabled={ownerState.disabled ? "" : undefined}
            data-readonly={ownerState.readOnly ? "" : undefined}
            data-selectablegroups={ownerState.selectableGroups ? "" : undefined}
            className={clsx(styles.root, className)}
        >
            <div {...groupProps}>
                {/* The options are named by their own text, not by the surrounding field */}
                <FieldContextReset>
                    {selectAllLabel != null && (
                        <div className={styles.selectAll}>
                            <Checkbox
                                {...optionCheckState(allOptions, selected)}
                                disabled={disabled || optionValues(allOptions, true).length === 0}
                                readOnly={readOnly}
                                aria-invalid={ownerState.invalid}
                                onChange={() => onChange(toggleOption(options, value, allOptions))}
                            >
                                {selectAllLabel}
                            </Checkbox>
                        </div>
                    )}
                    {options.map((option, index) => renderOption(option, String(index), false))}
                </FieldContextReset>
            </div>
        </div>
    );
}) as <Value extends string = string>(props: CheckboxGroupProps<Value> & RefAttributes<HTMLDivElement>) => ReactNode;
