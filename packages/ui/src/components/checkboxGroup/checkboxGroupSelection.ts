import type { CheckboxGroupOption } from "./CheckboxGroup";

function isGroup<Value extends string>(option: CheckboxGroupOption<Value>) {
    return option.children != null && option.children.length > 0;
}

/**
 * The values an option stands for: its own value, or – for a group – the values of all options inside it. With `enabledOnly`, leaves out
 * disabled options and the options inside a disabled group.
 */
export function optionValues<Value extends string>(option: CheckboxGroupOption<Value>, enabledOnly = false): Value[] {
    if (enabledOnly && option.disabled) {
        return [];
    }
    if (!isGroup(option)) {
        return [option.value];
    }
    return (option.children ?? []).flatMap((child) => optionValues(child, enabledOnly));
}

/**
 * Whether an option's checkbox is checked: a group is checked when all options inside it are, and indeterminate when only some are.
 */
export function optionCheckState<Value extends string>(option: CheckboxGroupOption<Value>, selected: ReadonlySet<Value>) {
    const values = optionValues(option);
    const selectedCount = values.filter((value) => selected.has(value)).length;
    return {
        checked: values.length > 0 && selectedCount === values.length,
        indeterminate: selectedCount > 0 && selectedCount < values.length,
    };
}

/**
 * The new value after toggling an option. A group selects all its enabled options unless they are all selected already, then it clears
 * them. The result keeps the options' order, and keeps values that match no option at the end.
 */
export function toggleOption<Value extends string>(
    options: ReadonlyArray<CheckboxGroupOption<Value>>,
    value: ReadonlyArray<Value>,
    option: CheckboxGroupOption<Value>,
): Value[] {
    const selected = new Set(value);
    const enabledValues = optionValues(option, true);
    const allEnabledSelected = enabledValues.every((enabledValue) => selected.has(enabledValue));
    for (const enabledValue of enabledValues) {
        if (allEnabledSelected) {
            selected.delete(enabledValue);
        } else {
            selected.add(enabledValue);
        }
    }
    const allValues = options.flatMap((item) => optionValues(item));
    const known = new Set(allValues);
    return [...allValues.filter((item) => selected.has(item)), ...value.filter((item) => !known.has(item) && selected.has(item))];
}
