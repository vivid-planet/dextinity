import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { clsx } from "clsx";
import { type ForwardedRef, forwardRef, type HTMLAttributes, type ReactNode, type RefAttributes, useCallback, useState } from "react";

import { useThemePortalContainer } from "../../utils/themePortalContainer";
import { Field, type FieldBaseProps, type FieldControlProps, type FieldOwnerState, type FieldProps } from "../field/Field";
import { Icon } from "../icon/Icon";
import { defaultGetKey } from "../select/optionKey";
import { Spinner } from "../spinner/Spinner";
import styles from "./Combobox.module.scss";
import { useAsyncOptions } from "./useAsyncOptions";

/**
 * The value of a `Combobox`: a list of options with `multiple`, otherwise one option or `null` for nothing chosen.
 */
export type ComboboxValue<Multiple extends boolean, Option> = Multiple extends true ? Option[] : Option | null;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ComboboxOwnerState = FieldOwnerState & {
    multiple: boolean;
};

/**
 * Texts of the combobox, for translation.
 */
export interface ComboboxLabels {
    /** Shown while the options load. */
    loading: string;
    /** Shown when no option matches the input. */
    noResults: string;
    /** Shown when loading the options failed. */
    error: string;
    /** The option that loads the options again after an error. */
    retry: string;
    /** The option that creates a new option from the input. */
    create: (query: string) => string;
    /** Accessible name of a chip's remove button. */
    remove: (optionLabel: string) => string;
    /** Accessible name of the button that clears the choice. */
    clear: string;
}

const defaultLabels: ComboboxLabels = {
    loading: "Loading…",
    noResults: "No results",
    error: "The options couldn't be loaded.",
    retry: "Retry",
    create: (query) => `Create “${query}”`,
    remove: (optionLabel) => `Remove ${optionLabel}`,
    clear: "Clear",
};

export interface ComboboxProps<Option, Multiple extends boolean = false>
    extends FieldBaseProps, Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "prefix" | "onChange" | "defaultValue"> {
    /** Field name. Describes the data, not the UI. */
    name: string;
    /** The chosen option, a list of options with `multiple`, or `null` when nothing is chosen. Always controlled. */
    value: ComboboxValue<Multiple, Option>;
    /** Called with the new selection; set `value` from it. */
    onChange: (value: ComboboxValue<Multiple, Option>) => void;
    /**
     * Loads the options matching the text typed into the field, e.g. from an API. Called with an empty query when the menu opens. Abort the
     * request on `signal`: a newer query replaces it.
     */
    loadOptions: (query: string, context: { signal: AbortSignal }) => Promise<Option[]>;
    /** The option as plain text, shown in the field, the chips, and by default in the menu. */
    getOptionLabel: (option: Option) => string;
    /**
     * A unique string for an option, to tell whether it is chosen and to submit it with a native form.
     *
     * @defaultValue the option's `id` for objects that have one, otherwise the option itself as a string
     */
    getOptionKey?: (option: Option) => string;
    /** The option's content in the menu, e.g. with an image or a second line. Defaults to the label. */
    renderOption?: (option: Option) => ReactNode;
    /** Shows an option in the menu without allowing to choose it. */
    isOptionDisabled?: (option: Option) => boolean;
    /**
     * Allows choosing several options, shown as chips in the field.
     *
     * @defaultValue `false`
     */
    multiple?: Multiple;
    /**
     * Milliseconds to wait after typing before loading the options.
     *
     * @defaultValue `300`
     */
    debounce?: number;
    /**
     * Offers to create an option from the typed text when no option has that label. Return the new option, e.g. after saving it; it gets
     * chosen. A rejected promise leaves the value unchanged, so report the error, e.g. in a toast.
     */
    onCreate?: (query: string) => Option | Promise<Option>;
    /** Shown while nothing is chosen. */
    placeholder?: string;
    /** Texts of the menu's states, the chips, and the clear button, for translation. */
    labels?: Partial<ComboboxLabels>;
    /** The id of the input, used to connect it with the label. */
    id?: string;
    /** Added alongside the component's own classes, on the root. */
    className?: string;
    /** Props for each slot of the field frame, merged with the slot's own props rather than replacing them. */
    slotProps?: FieldProps["slotProps"];
}

type OptionEntry<Option> = { kind: "option"; key: string; option: Option };
type Entry<Option> = OptionEntry<Option> | { kind: "create"; key: string; query: string } | { kind: "retry"; key: string };

function toList<Value>(value: Value | Value[] | null): Value[] {
    if (value == null) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
}

function defaultGetOptionKey(option: unknown): string {
    if (typeof option === "object" && option != null && "id" in option && (typeof option.id === "string" || typeof option.id === "number")) {
        return String(option.id);
    }
    return defaultGetKey(option);
}

function inputProps(control: FieldControlProps) {
    return {
        id: control.id,
        "aria-labelledby": control["aria-labelledby"],
        "aria-describedby": control["aria-describedby"],
        "aria-invalid": control["aria-invalid"],
        "aria-required": control["aria-required"],
        "aria-busy": control["aria-busy"],
    };
}

const fieldBoxSelector = ".dextinityField__box";

/**
 * Choosing from options loaded while typing, e.g. from an API, one or several, with an optional way to create a missing option.
 */
export const Combobox = forwardRef(function Combobox<Option, Multiple extends boolean = false>(
    {
        label,
        required,
        helperText,
        validationMessage,
        state,
        disabled = false,
        readOnly = false,
        loading = false,
        size,
        prefix,
        suffix,
        actions,
        name,
        value,
        onChange,
        loadOptions,
        getOptionLabel,
        getOptionKey = defaultGetOptionKey,
        renderOption,
        isOptionDisabled,
        multiple,
        debounce = 300,
        onCreate,
        placeholder,
        labels: labelsProp,
        id,
        className,
        slotProps,
        ...restProps
    }: ComboboxProps<Option, Multiple>,
    ref: ForwardedRef<HTMLInputElement>,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const isMultiple = multiple === true;
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [creating, setCreating] = useState(false);
    const { anchor, anchorRef, container } = useThemePortalContainer<HTMLInputElement>();
    const fieldBox = anchor?.closest<HTMLElement>(fieldBoxSelector) ?? null;
    const setInputRef = useCallback(
        (element: HTMLInputElement | null) => {
            anchorRef(element);
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        },
        [anchorRef, ref],
    );

    const toEntry = (option: Option): OptionEntry<Option> => ({ kind: "option", key: `option:${getOptionKey(option)}`, option });
    const selectedEntries = toList(value as Option | Option[] | null).map(toEntry);

    // In a single combobox, the input shows the chosen option's label until the user types something else
    const showsChosenLabel = !isMultiple && selectedEntries.length > 0 && inputValue === getOptionLabel(selectedEntries[0].option);
    const query = showsChosenLabel ? "" : inputValue.trim();
    const { status, options, retry } = useAsyncOptions({ loadOptions, query, enabled: open, debounce });

    const optionEntries: Entry<Option>[] = status === "error" ? [{ kind: "retry", key: "retry" }] : options.map(toEntry);
    const canCreate =
        onCreate != null &&
        query !== "" &&
        status === "success" &&
        !options.some((option) => getOptionLabel(option).toLocaleLowerCase() === query.toLocaleLowerCase());
    const entries: Entry<Option>[] = canCreate ? [...optionEntries, { kind: "create", key: `create:${query}`, query }] : optionEntries;

    const emit = (next: Option[]) => {
        onChange((isMultiple ? next : (next[0] ?? null)) as ComboboxValue<Multiple, Option>);
    };

    const create = async (createQuery: string, chosen: Option[]) => {
        if (onCreate == null) {
            return;
        }
        setCreating(true);
        try {
            const created = await onCreate(createQuery);
            emit([...chosen, created]);
        } catch {
            // The application reports the error; the value stays as it was
        } finally {
            setCreating(false);
        }
    };

    const handleValueChange = (next: Entry<Option> | Entry<Option>[] | null, eventDetails: { cancel: () => void }) => {
        const nextEntries = toList(next);
        if (nextEntries.some((entry) => entry.kind === "retry")) {
            // Keeps the value and the open menu, which shows the options once they are loaded
            eventDetails.cancel();
            retry();
            return;
        }
        const chosen = nextEntries.flatMap((entry) => (entry.kind === "option" ? [entry.option] : []));
        const createEntry = nextEntries.find((entry) => entry.kind === "create");
        if (createEntry != null) {
            void create(createEntry.query, isMultiple ? chosen : []);
            return;
        }
        emit(chosen);
    };

    const entryLabel = (entry: Entry<Option>) =>
        entry.kind === "option" ? getOptionLabel(entry.option) : entry.kind === "create" ? entry.query : labels.retry;
    const hasValue = selectedEntries.length > 0;
    const showsClear = !isMultiple && hasValue && !required && !disabled && !readOnly;

    const statusContent =
        status === "loading" ? (
            <>
                <Spinner size="small" />
                {labels.loading}
            </>
        ) : status === "error" ? (
            labels.error
        ) : entries.length === 0 ? (
            labels.noResults
        ) : null;

    return (
        <Field
            {...restProps}
            className={clsx(styles.root, className)}
            data-multiple={isMultiple ? "" : undefined}
            controlId={id}
            label={label}
            required={required}
            helperText={helperText}
            validationMessage={validationMessage}
            state={state}
            disabled={disabled}
            readOnly={readOnly}
            loading={loading || creating}
            size={size}
            prefix={prefix}
            suffix={suffix}
            actions={actions}
            slotProps={slotProps}
        >
            {(control) => (
                <BaseCombobox.Root
                    items={entries}
                    filter={null}
                    multiple={isMultiple}
                    value={isMultiple ? selectedEntries : (selectedEntries[0] ?? null)}
                    onValueChange={handleValueChange}
                    open={open}
                    onOpenChange={setOpen}
                    onInputValueChange={setInputValue}
                    itemToStringLabel={entryLabel}
                    itemToStringValue={(entry: Entry<Option>) => entry.key}
                    isItemEqualToValue={(entry: Entry<Option>, selected: Entry<Option>) => entry.key === selected.key}
                    name={name}
                    disabled={disabled}
                    readOnly={readOnly}
                    required={required}
                    autoHighlight
                >
                    {isMultiple ? (
                        <BaseCombobox.Chips className={styles.chips}>
                            {selectedEntries.map((entry) => {
                                const optionLabel = entryLabel(entry);
                                return (
                                    <BaseCombobox.Chip key={entry.key} className={styles.chip}>
                                        {optionLabel}
                                        <BaseCombobox.ChipRemove className={styles.chipRemove} aria-label={labels.remove(optionLabel)}>
                                            <Icon name="close" />
                                        </BaseCombobox.ChipRemove>
                                    </BaseCombobox.Chip>
                                );
                            })}
                            <BaseCombobox.Input
                                {...inputProps(control)}
                                ref={setInputRef}
                                className={styles.input}
                                placeholder={hasValue ? undefined : placeholder}
                            />
                        </BaseCombobox.Chips>
                    ) : (
                        <BaseCombobox.Input {...inputProps(control)} ref={setInputRef} className={styles.input} placeholder={placeholder} />
                    )}
                    {showsClear && (
                        <BaseCombobox.Clear className={styles.iconButton} aria-label={labels.clear}>
                            <Icon name="close" />
                        </BaseCombobox.Clear>
                    )}
                    <BaseCombobox.Trigger className={clsx(styles.iconButton, styles.chevron)} tabIndex={-1}>
                        <Icon name="chevron-down" />
                    </BaseCombobox.Trigger>
                    <BaseCombobox.Portal container={container}>
                        <BaseCombobox.Positioner className={styles.positioner} anchor={fieldBox} sideOffset={6} align="start">
                            <BaseCombobox.Popup className={styles.popup} aria-busy={status === "loading" ? true : undefined}>
                                <BaseCombobox.Status className={styles.status}>{statusContent}</BaseCombobox.Status>
                                <BaseCombobox.List className={styles.list}>
                                    {(entry: Entry<Option>) =>
                                        entry.kind === "retry" ? (
                                            <BaseCombobox.Item key={entry.key} value={entry} className={styles.item}>
                                                <span className={styles.itemIcon}>
                                                    <Icon name="reload" />
                                                </span>
                                                <span className={styles.itemText}>{labels.retry}</span>
                                            </BaseCombobox.Item>
                                        ) : entry.kind === "create" ? (
                                            <BaseCombobox.Item key={entry.key} value={entry} className={styles.item}>
                                                <span className={styles.itemIcon}>
                                                    <Icon name="plus" />
                                                </span>
                                                <span className={styles.itemText}>{labels.create(entry.query)}</span>
                                            </BaseCombobox.Item>
                                        ) : (
                                            <BaseCombobox.Item
                                                key={entry.key}
                                                value={entry}
                                                disabled={isOptionDisabled?.(entry.option)}
                                                className={styles.item}
                                            >
                                                <span className={styles.itemText}>
                                                    {renderOption != null ? renderOption(entry.option) : getOptionLabel(entry.option)}
                                                </span>
                                                <BaseCombobox.ItemIndicator className={styles.itemIndicator}>
                                                    <Icon name="check" />
                                                </BaseCombobox.ItemIndicator>
                                            </BaseCombobox.Item>
                                        )
                                    }
                                </BaseCombobox.List>
                            </BaseCombobox.Popup>
                        </BaseCombobox.Positioner>
                    </BaseCombobox.Portal>
                </BaseCombobox.Root>
            )}
        </Field>
    );
}) as <Option, Multiple extends boolean = false>(props: ComboboxProps<Option, Multiple> & RefAttributes<HTMLInputElement>) => ReactNode;
