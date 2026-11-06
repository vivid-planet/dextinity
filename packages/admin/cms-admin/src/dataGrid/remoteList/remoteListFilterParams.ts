/**
 * How a filter of a remote list is kept in the URL. A value equal to `defaultValue` is left out of the URL.
 */
export interface RemoteListFilterParam<Value> {
    defaultValue: Value;
    /** Reads the value from the URL; `undefined` for a value that isn't valid, which falls back to `defaultValue`. */
    parse: (value: string) => Value | undefined;
    serialize: (value: Value) => string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each filter has its own value type, and `parse`/`serialize` make it invariant
export type RemoteListFilterParams = Record<string, RemoteListFilterParam<any>>;

export type RemoteListFilterValues<Params extends RemoteListFilterParams> = {
    [Key in keyof Params]: Params[Key] extends RemoteListFilterParam<infer Value> ? Value : never;
};

function oneOf<const Value extends string>(values: readonly Value[], defaultValue: Value): RemoteListFilterParam<Value>;
function oneOf<const Value extends string>(values: readonly Value[], defaultValue?: null): RemoteListFilterParam<Value | null>;
function oneOf<const Value extends string>(values: readonly Value[], defaultValue: Value | null = null): RemoteListFilterParam<Value | null> {
    return {
        defaultValue,
        parse: (value) => ((values as readonly string[]).includes(value) ? (value as Value) : undefined),
        serialize: (value) => value ?? "",
    };
}

function boolean(defaultValue = false): RemoteListFilterParam<boolean> {
    return {
        defaultValue,
        parse: (value) => (value === "true" ? true : value === "false" ? false : undefined),
        serialize: (value) => String(value),
    };
}

function string(defaultValue = ""): RemoteListFilterParam<string> {
    return {
        defaultValue,
        parse: (value) => value,
        serialize: (value) => value,
    };
}

/**
 * Filters for `useRemoteListState`, e.g. `{ status: remoteListFilterParam.oneOf(["active", "deleted"]) }`.
 */
export const remoteListFilterParam = { oneOf, boolean, string };
