import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { clsx } from "clsx";
import { type CSSProperties, forwardRef, type HTMLAttributes, type KeyboardEvent, useId, useState } from "react";

import { Field } from "../field/Field";
import { Icon } from "../icon/Icon";
import { Input } from "../input/Input";
import { Popover, type PopoverPlacement } from "../popover/Popover";
import styles from "./ScopeSwitcher.module.scss";

/**
 * One value of a scope dimension, e.g. the country Austria.
 */
export interface ScopeSwitcherOption {
    value: string;
    label: string;
    /** Short form for narrow top bars and the recent scopes, e.g. "AT". Also found by the search. */
    shortLabel?: string;
}

/**
 * One dimension of the scope, e.g. country or language.
 */
export interface ScopeSwitcherDimension {
    /** Stable key of the dimension. */
    key: string;
    /** Shown above the dimension's column. */
    label: string;
    options: ScopeSwitcherOption[];
}

export interface ScopeSwitcherLabels {
    /** Accessible name of the trigger, followed by the current scope. */
    trigger: string;
    /** Accessible name of the search field. */
    search: string;
    /** Placeholder of the search field. */
    searchPlaceholder: string;
    /** Above the recently used scopes. */
    recent: string;
    /** Shown when the search finds no scope. */
    noResults: string;
}

const defaultLabels: ScopeSwitcherLabels = {
    trigger: "Change scope",
    search: "Search scopes",
    searchPlaceholder: "Search, e.g. ch fr",
    recent: "Recent",
    noResults: "No matching scope",
};

const separator = " · ";
const maxSearchResults = 30;

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type ScopeSwitcherOwnerState = {
    searchable: boolean;
};

export interface ScopeSwitcherProps extends Omit<HTMLAttributes<HTMLButtonElement>, "className" | "children" | "onChange"> {
    /** Two or three dimensions, e.g. country and language. */
    dimensions: ScopeSwitcherDimension[];
    /** The selected option's value per dimension, in the order of `dimensions`. */
    value: string[];
    /** Called with the new scope. The app then reloads the content in place. */
    onChange: (value: string[]) => void;
    /** Whether the picker is open. */
    open: boolean;
    /** Called when the picker opens or closes. */
    onOpenChange: (open: boolean) => void;
    /** Recently used scopes, listed at the bottom for a quick switch. */
    recent?: string[][];
    /**
     * Shows a search across all dimensions above the columns, e.g. "ch fr" finds Switzerland · French. Picking a result closes the picker.
     *
     * @defaultValue `true`
     */
    searchable?: boolean;
    /**
     * The preferred position of the popup next to the trigger. The popup flips when there isn't enough room.
     *
     * @defaultValue `"bottom-end"`
     */
    placement?: PopoverPlacement;
    /** The built-in texts. */
    labels?: Partial<ScopeSwitcherLabels>;
    /** Added alongside the component's own classes. */
    className?: string;
}

function optionOf(dimension: ScopeSwitcherDimension | undefined, value: string | undefined) {
    return dimension?.options.find((option) => option.value === value);
}

function scopeText(dimensions: ScopeSwitcherDimension[], value: string[], short: boolean) {
    return dimensions
        .map((dimension, index) => {
            const option = optionOf(dimension, value[index]);
            return short ? (option?.shortLabel ?? option?.label) : option?.label;
        })
        .filter((text) => text != null)
        .join(separator);
}

function combinations(dimensions: ScopeSwitcherDimension[]): ScopeSwitcherOption[][] {
    return dimensions.reduce<ScopeSwitcherOption[][]>(
        (combos, dimension) => combos.flatMap((combo) => dimension.options.map((option) => [...combo, option])),
        [[]],
    );
}

function matchesQuery(combo: ScopeSwitcherOption[], terms: string[]) {
    const words = combo.flatMap((option) => [option.label, option.shortLabel ?? "", option.value].map((word) => word.toLowerCase()));
    return terms.every((term) => words.some((word) => word.startsWith(term)));
}

/**
 * Picks the global scope, e.g. country · language: a search across all dimensions, a column per dimension, and the recently used
 * scopes.
 */
export const ScopeSwitcher = forwardRef<HTMLButtonElement, ScopeSwitcherProps>(function ScopeSwitcher(
    {
        dimensions,
        value,
        onChange,
        open,
        onOpenChange,
        recent,
        searchable = true,
        placement = "bottom-end",
        labels: labelsProp,
        className,
        ...restProps
    },
    ref,
) {
    const labels = { ...defaultLabels, ...labelsProp };
    const ownerState: ScopeSwitcherOwnerState = { searchable };
    const [query, setQuery] = useState("");
    const columnId = useId();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results =
        terms.length > 0
            ? combinations(dimensions)
                  .filter((combo) => matchesQuery(combo, terms))
                  .slice(0, maxSearchResults)
            : [];

    function pick(nextValue: string[]) {
        onChange(nextValue);
        onOpenChange(false);
    }

    function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter" && results.length > 0) {
            event.preventDefault();
            pick(results[0].map((option) => option.value));
        }
    }

    const longText = scopeText(dimensions, value, false);

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
                if (!nextOpen) {
                    setQuery("");
                }
            }}
            placement={placement}
            className={styles.popup}
            style={{ "--dextinity-scope-switcher-columns": dimensions.length } as CSSProperties}
            trigger={
                <button
                    type="button"
                    aria-label={`${labels.trigger}: ${longText}`}
                    {...restProps}
                    ref={ref}
                    data-searchable={ownerState.searchable ? "" : undefined}
                    className={clsx(styles.root, className)}
                >
                    <Icon name="globe" className={styles.icon} />
                    <span className={styles.text}>
                        <span className={styles.longText}>{longText}</span>
                        <span className={styles.shortText}>{scopeText(dimensions, value, true)}</span>
                    </span>
                    <Icon name="chevron-down" className={styles.chevron} />
                </button>
            }
        >
            {ownerState.searchable && (
                <Field label={labels.search} prefix={<Icon name="search" />} size="small" className={styles.search}>
                    <Input
                        name="scope-search"
                        type="search"
                        placeholder={labels.searchPlaceholder}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        autoComplete="off"
                    />
                </Field>
            )}
            {terms.length > 0 ? (
                <div className={styles.results}>
                    {results.length === 0 ? (
                        <p className={styles.noResults}>{labels.noResults}</p>
                    ) : (
                        results.map((combo) => {
                            const comboValue = combo.map((option) => option.value);
                            return (
                                <button
                                    key={comboValue.join("/")}
                                    type="button"
                                    className={styles.option}
                                    aria-current={comboValue.every((optionValue, index) => optionValue === value[index]) ? "true" : undefined}
                                    onClick={() => pick(comboValue)}
                                >
                                    {combo.map((option) => option.label).join(separator)}
                                </button>
                            );
                        })
                    )}
                </div>
            ) : (
                <div className={styles.columns}>
                    {dimensions.map((dimension, index) => (
                        <div key={dimension.key} className={styles.column}>
                            <span id={`${columnId}-${dimension.key}`} className={styles.columnLabel}>
                                {dimension.label}
                            </span>
                            <BaseRadioGroup
                                aria-labelledby={`${columnId}-${dimension.key}`}
                                value={value[index] ?? null}
                                onValueChange={(optionValue) => onChange(value.map((current, i) => (i === index ? String(optionValue) : current)))}
                                className={styles.columnOptions}
                            >
                                {dimension.options.map((option) => (
                                    <BaseRadio.Root key={option.value} value={option.value} className={styles.option}>
                                        <span className={styles.optionLabel}>{option.label}</span>
                                        {option.shortLabel != null && <span className={styles.optionShortLabel}>{option.shortLabel}</span>}
                                    </BaseRadio.Root>
                                ))}
                            </BaseRadioGroup>
                        </div>
                    ))}
                </div>
            )}
            {recent != null && recent.length > 0 && terms.length === 0 && (
                <div className={styles.recent} role="group" aria-label={labels.recent}>
                    <span className={styles.recentLabel}>{labels.recent}</span>
                    {recent.map((recentValue) => (
                        <button key={recentValue.join("/")} type="button" className={styles.recentScope} onClick={() => pick(recentValue)}>
                            {scopeText(dimensions, recentValue, true)}
                        </button>
                    ))}
                </div>
            )}
        </Popover>
    );
});
