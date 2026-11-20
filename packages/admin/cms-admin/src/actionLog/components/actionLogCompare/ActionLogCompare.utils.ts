export const defaultFilterOutKeys = ["updatedAt", "createdAt", "fullText"];

export function filterOutKeys<T>(value: T, keysToBeRemoved: readonly string[]): T {
    if (Array.isArray(value)) {
        return value.map((item) => filterOutKeys(item, keysToBeRemoved)) as T;
    }
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .filter(([key]) => !keysToBeRemoved.includes(key))
                .map(([key, v]) => [key, filterOutKeys(v, keysToBeRemoved)]),
        ) as T;
    }
    return value;
}
