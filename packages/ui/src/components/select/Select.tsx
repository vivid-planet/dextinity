import { Combobox } from "@base-ui/react/combobox";
import { Select as BaseSelect } from "@base-ui/react/select";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useCallback, useId } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Field, type FieldBaseProps, type FieldControlProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import styles from "./Select.module.scss";

/**
 * An option of a `Select`.
 */
export interface SelectOption {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
}

/**
 * The value of a `Select`: a list with `multiple`, otherwise one value or `null` for nothing chosen.
 */
export type SelectValue<Multiple extends boolean> = Multiple extends true ? string[] : string | null;

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

export interface SelectProps<Multiple extends boolean = false>
    extends FieldBaseProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The options to choose from. */
    options: SelectOption[];
    /** The chosen option's value, a list of values with `multiple`, or `null` when nothing is chosen. Always controlled. */
    value: SelectValue<Multiple>;
    /** Called with the new selection; set `value` from it. */
    onChange: (value: SelectValue<Multiple>) => void;
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

function toList(value: string | string[] | null): string[] {
    if (value == null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
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
export const Select = forwardRef(function Select<Multiple extends boolean = false>(
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
        multiple,
        searchable = false,
        placeholder,
        labels: labelsProp,
        id,
        className,
        slotProps,
        ...restProps
    }: SelectProps<Multiple>,
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

    const selectedValues = toList(value);
    const selectedOptions = selectedValues
        .map((selected) => options.find((option) => option.value === selected))
        .filter((option): option is SelectOption => option != null);
    const selectedText = selectedOptions.map((option) => option.label).join(", ");

    const emit = (next: string[]) => {
        onChange((isMultiple ? next : (next[0] ?? null)) as SelectValue<Multiple>);
    };

    const triggerContent = (
        <>
            {isMultiple ? (
                <span id={valueId} className={styles.visuallyHidden}>
                    {selectedText}
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
        ? selectedOptions.map((option) => (
              <span key={option.value} className={styles.chip}>
                  {option.label}
                  <button
                      type="button"
                      className={styles.chipRemove}
                      aria-label={labels.remove(option.label)}
                      disabled={disabled || readOnly}
                      onClick={() => emit(selectedValues.filter((selected) => selected !== option.value))}
                  >
                      <Icon name="close" />
                  </button>
              </span>
          ))
        : null;

    const itemContent = (option: SelectOption, ItemIndicator: typeof BaseSelect.ItemIndicator | typeof Combobox.ItemIndicator) => (
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
                        onValueChange={(next: SelectOption | SelectOption[] | null) =>
                            emit(toList(Array.isArray(next) ? next.map((option) => option.value) : (next?.value ?? null)))
                        }
                        onInputValueChange={(_inputValue, eventDetails) => {
                            if (eventDetails.isItemPress) {
                                eventDetails.cancel();
                            }
                        }}
                        itemToStringLabel={(option: SelectOption) => option.label}
                        itemToStringValue={(option: SelectOption) => option.value}
                        isItemEqualToValue={(option: SelectOption, selected: SelectOption) => option.value === selected.value}
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
                                        {(option: SelectOption) => (
                                            <Combobox.Item key={option.value} value={option} disabled={option.disabled} className={styles.item}>
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
                        items={options}
                        multiple={isMultiple}
                        value={isMultiple ? selectedValues : (selectedValues[0] ?? null)}
                        onValueChange={(next: string | string[] | null) => emit(toList(next))}
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
                                                key={option.value}
                                                value={option.value}
                                                label={option.label}
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
}) as <Multiple extends boolean = false>(props: SelectProps<Multiple> & RefAttributes<HTMLButtonElement>) => ReactNode;
