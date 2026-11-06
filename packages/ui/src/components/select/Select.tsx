import { Combobox } from "@base-ui/react/combobox";
import { Select as BaseSelect } from "@base-ui/react/select";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, Fragment, type HTMLAttributes, type ReactNode, type RefAttributes, useCallback, useId } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Field, type FieldBaseProps, type FieldControlProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import { defaultGetKey } from "./optionKey";
import styles from "./Select.module.scss";

/**
 * An option of a `Select`.
 */
export interface SelectOption<Value = string> {
    /** What the option stands for, e.g. an id, a number, or an object. */
    value: Value;
    /** What the option shows, in the menu and in the field. */
    label: ReactNode;
    /** The option as plain text, for the search, typeahead, and the accessible names of chips. Required when `label` isn't a string. */
    textValue?: string;
    /** Shown before the label in the menu. */
    icon?: ReactNode;
    /** Shows the option without allowing to choose it. */
    disabled?: boolean;
}

/**
 * The value of a `Select`: a list with `multiple`, otherwise one value or `null` for nothing chosen.
 */
export type SelectValue<Multiple extends boolean, Value = string> = Multiple extends true ? Value[] : Value | null;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type SelectOwnerState = FieldOwnerState & {
    multiple: boolean;
    searchable: boolean;
};

/**
 * Texts of the select, for translation.
 */
export interface SelectLabels {
    /** Placeholder of the search in the menu. */
    search: string;
    /** Shown when the search finds no option. */
    noResults: string;
    /** Accessible name of a chip's remove button. */
    remove: (optionLabel: string) => string;
}

const defaultLabels: SelectLabels = {
    search: "Search",
    noResults: "No results",
    remove: (optionLabel) => `Remove ${optionLabel}`,
};

export interface SelectProps<Multiple extends boolean = false, Value = string>
    extends FieldBaseProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The options to choose from. */
    options: SelectOption<Value>[];
    /** The chosen option's value, a list of values with `multiple`, or `null` when nothing is chosen. Always controlled. */
    value: SelectValue<Multiple, Value>;
    /** Called with the new selection; set `value` from it. */
    onChange: (value: SelectValue<Multiple, Value>) => void;
    /**
     * Whether an option's value is the chosen value, e.g. comparing objects by their id.
     *
     * @defaultValue compares the values' keys (see `getKey`)
     */
    isOptionEqualToValue?: (optionValue: Value, value: Value) => boolean;
    /**
     * A unique string for a value, used as the value submitted with a native form.
     *
     * @defaultValue the value itself for strings, `String(value)` for numbers and booleans, `JSON.stringify(value)` otherwise
     */
    getKey?: (value: Value) => string;
    /**
     * Allows choosing several options, shown as chips in the field.
     *
     * @defaultValue `false`
     */
    multiple?: Multiple;
    /**
     * Adds a search to the menu. Use it from about 10 options.
     *
     * @defaultValue `false`
     */
    searchable?: boolean;
    /** Shown while nothing is chosen. */
    placeholder?: string;
    /** Texts of the search, the empty result, and the chips, for translation. */
    labels?: Partial<SelectLabels>;
    /** The id of the trigger, used to connect it with the label. */
    id?: string;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

function toList<Value>(value: Value | Value[] | null): Value[] {
    if (value == null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function optionText(option: { label: ReactNode; textValue?: string }): string {
    if (option.textValue != null) {
        return option.textValue;
    }
    return typeof option.label === "string" || typeof option.label === "number" ? String(option.label) : "";
}

function triggerProps(control: FieldControlProps, valueId: string) {
    return {
        id: control.id,
        "aria-labelledby": `${control["aria-labelledby"]} ${valueId}`,
        "aria-describedby": control["aria-describedby"],
        "aria-invalid": control["aria-invalid"],
        "aria-required": control["aria-required"],
        "aria-busy": control["aria-busy"],
    };
}

/**
 * Choosing from a list of options, one or several, with an optional search in the menu.
 */
export const Select = forwardRef(function Select<Multiple extends boolean = false, Value = string>(
    {
        label,
        required,
        helperText,
        validationMessage,
        state,
        disabled = false,
        readOnly = false,
        loading,
        size,
        prefix,
        suffix,
        actions,
        name,
        options,
        value,
        onChange,
        isOptionEqualToValue,
        getKey = defaultGetKey,
        multiple,
        searchable = false,
        placeholder,
        labels: labelsProp,
        id,
        className,
        slotProps,
        ...restProps
    }: SelectProps<Multiple, Value>,
    ref: ForwardedRef<HTMLButtonElement>,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const isMultiple = multiple === true;
    const valueId = `${useId()}value`;
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLButtonElement>();
    const fieldBox = anchor?.parentElement ?? null;
    const setTriggerRef = useCallback(
        (element: HTMLButtonElement | null) => {
            anchorRef(element);
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        },
        [anchorRef, ref],
    );

    const matches = isOptionEqualToValue ?? ((optionValue: Value, selected: Value) => getKey(optionValue) === getKey(selected));
    const optionsByKey = new Map(options.map((option) => [getKey(option.value), option]));
    const selectedOptions = toList(value as Value | Value[] | null)
        .map((selected) => options.find((option) => matches(option.value, selected)))
        .filter((option): option is SelectOption<Value> => option != null);
    const selectedKeys = selectedOptions.map((option) => getKey(option.value));

    const emit = (next: SelectOption<Value>[]) => {
        const values = next.map((option) => option.value);
        onChange((isMultiple ? values : (values[0] ?? null)) as SelectValue<Multiple, Value>);
    };
    const emitKeys = (keys: string[]) =>
        emit(keys.map((key) => optionsByKey.get(key)).filter((option): option is SelectOption<Value> => option != null));

    const triggerContent = (
        <>
            {isMultiple ? (
                <span id={valueId} className={styles.visuallyHidden}>
                    {selectedOptions.map((option, index) => (
                        <Fragment key={selectedKeys[index]}>
                            {index > 0 && ", "}
                            {option.label}
                        </Fragment>
                    ))}
                </span>
            ) : (
                selectedOptions.length > 0 && (
                    <span id={valueId} className={styles.value}>
                        {selectedOptions[0].label}
                    </span>
                )
            )}
            {selectedOptions.length === 0 && <span className={styles.placeholder}>{placeholder}</span>}
        </>
    );

    const chips = isMultiple
        ? selectedOptions.map((option, index) => (
              <span key={selectedKeys[index]} className={styles.chip}>
                  {option.label}
                  <button
                      type="button"
                      className={styles.chipRemove}
                      aria-label={labels.remove(optionText(option))}
                      disabled={disabled || readOnly}
                      onClick={() => emit(selectedOptions.filter((selected) => selected !== option))}
                  >
                      <Icon name="close" />
                  </button>
              </span>
          ))
        : null;

    const itemContent = (option: SelectOption<Value>, ItemIndicator: typeof BaseSelect.ItemIndicator | typeof Combobox.ItemIndicator) => (
        <>
            {option.icon != null && <span className={styles.itemIcon}>{option.icon}</span>}
            <span className={styles.itemText}>{option.label}</span>
            <ItemIndicator className={styles.itemIndicator}>
                <Icon name="check" />
            </ItemIndicator>
        </>
    );

    return (
        <Field
            {...restProps}
            className={clsx(styles.root, className)}
            data-multiple={isMultiple ? "" : undefined}
            data-searchable={searchable ? "" : undefined}
            controlId={id}
            label={label}
            required={required}
            helperText={helperText}
            validationMessage={validationMessage}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={actions}
            slotProps={slotProps}
        >
            {(control) =>
                searchable ? (
                    <Combobox.Root
                        items={options}
                        multiple={isMultiple}
                        value={isMultiple ? selectedOptions : (selectedOptions[0] ?? null)}
                        onValueChange={(next: SelectOption<Value> | SelectOption<Value>[] | null) => emit(toList(next))}
                        onInputValueChange={(_inputValue, eventDetails) => {
                            if (eventDetails.isItemPress) {
                                eventDetails.cancel();
                            }
                        }}
                        itemToStringLabel={(option: SelectOption<Value>) => optionText(option)}
                        itemToStringValue={(option: SelectOption<Value>) => getKey(option.value)}
                        isItemEqualToValue={(option: SelectOption<Value>, selected: SelectOption<Value>) =>
                            getKey(option.value) === getKey(selected.value)
                        }
                        name={name}
                        disabled={disabled}
                        readOnly={readOnly}
                        required={required}
                    >
                        {chips}
                        <Combobox.Trigger {...triggerProps(control, valueId)} ref={setTriggerRef} className={styles.trigger}>
                            {triggerContent}
                            <Combobox.Icon className={styles.chevron}>
                                <Icon name="chevron-down" />
                            </Combobox.Icon>
                        </Combobox.Trigger>
                        <Combobox.Portal container={container}>
                            <Combobox.Positioner className={styles.positioner} anchor={fieldBox} sideOffset={6} align="start">
                                <Combobox.Popup className={styles.popup}>
                                    <div className={styles.search}>
                                        <Icon name="search" />
                                        <Combobox.Input className={styles.searchInput} placeholder={labels.search} />
                                    </div>
                                    <Combobox.Empty className={styles.empty}>{labels.noResults}</Combobox.Empty>
                                    <Combobox.List className={styles.list}>
                                        {(option: SelectOption<Value>) => (
                                            <Combobox.Item
                                                key={getKey(option.value)}
                                                value={option}
                                                disabled={option.disabled}
                                                className={styles.item}
                                            >
                                                {itemContent(option, Combobox.ItemIndicator)}
                                            </Combobox.Item>
                                        )}
                                    </Combobox.List>
                                </Combobox.Popup>
                            </Combobox.Positioner>
                        </Combobox.Portal>
                    </Combobox.Root>
                ) : (
                    <BaseSelect.Root
                        multiple={isMultiple}
                        value={isMultiple ? selectedKeys : (selectedKeys[0] ?? null)}
                        onValueChange={(next: string | string[] | null) => emitKeys(toList(next))}
                        name={name}
                        disabled={disabled}
                        readOnly={readOnly}
                        required={required}
                    >
                        {chips}
                        <BaseSelect.Trigger {...triggerProps(control, valueId)} ref={setTriggerRef} className={styles.trigger}>
                            {triggerContent}
                            <BaseSelect.Icon className={styles.chevron}>
                                <Icon name="chevron-down" />
                            </BaseSelect.Icon>
                        </BaseSelect.Trigger>
                        <BaseSelect.Portal container={container}>
                            <BaseSelect.Positioner
                                className={styles.positioner}
                                anchor={fieldBox}
                                sideOffset={6}
                                align="start"
                                alignItemWithTrigger={false}
                            >
                                <BaseSelect.Popup className={styles.popup}>
                                    <BaseSelect.List className={styles.list}>
                                        {options.map((option) => (
                                            <BaseSelect.Item
                                                key={getKey(option.value)}
                                                value={getKey(option.value)}
                                                label={optionText(option)}
                                                disabled={option.disabled}
                                                className={styles.item}
                                            >
                                                {itemContent(option, BaseSelect.ItemIndicator)}
                                            </BaseSelect.Item>
                                        ))}
                                    </BaseSelect.List>
                                </BaseSelect.Popup>
                            </BaseSelect.Positioner>
                        </BaseSelect.Portal>
                    </BaseSelect.Root>
                )
            }
        </Field>
    );
}) as <Multiple extends boolean = false, Value = string>(props: SelectProps<Multiple, Value> & RefAttributes<HTMLButtonElement>) => ReactNode;
