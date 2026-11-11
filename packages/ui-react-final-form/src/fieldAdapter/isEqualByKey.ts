/**
 * The key `Select` gives a value when no `getKey` is set: the value itself for strings, `String(value)` for other primitives,
 * `JSON.stringify(value)` for objects.
 */
export function defaultValueKey(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "object" && value !== null) {
        return JSON.stringify(value) ?? "";
    }
    return String(value);
}

/**
 * The key `Combobox` gives an option when no `getOptionKey` is set: its `id` for objects that have one, otherwise `defaultValueKey`.
 */
export function defaultOptionKey(option: unknown): string {
    if (typeof option === "object" && option !== null && "id" in option && (typeof option.id === "string" || typeof option.id === "number")) {
        return String(option.id);
    }
    return defaultValueKey(option);
}

/**
 * A React Final Form `isEqual` that compares chosen values by their keys, so a field whose options are chosen again as new objects or in a
 * new list isn't dirty. `undefined`, `null`, `""`, and an empty list all mean nothing chosen.
 */
export function isEqualByKey<Value>(getKey: (value: Value) => string): (a: unknown, b: unknown) => boolean {
    const keys = (value: unknown) =>
        (value == null || value === "" ? [] : Array.isArray(value) ? value : [value]).map((item) => getKey(item as Value));
    return (a, b) => {
        if (a === b) {
            return true;
        }
        const aKeys = keys(a);
        const bKeys = keys(b);
        return aKeys.length === bKeys.length && aKeys.every((key, index) => key === bKeys[index]);
    };
}
