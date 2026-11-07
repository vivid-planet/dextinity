function isEmptyScalar(value: unknown) {
    return value === undefined || value === null || value === "";
}

/**
 * The adapters' default React Final Form `isEqual`: `undefined`, `null`, and `""` are equal, otherwise `===`. React Final Form turns a
 * cleared text into `undefined`, so without it a field whose initial value is `""` or `null` stays dirty after clearing it.
 */
export function isEqualTreatingEmptyAlike(a: unknown, b: unknown): boolean {
    return a === b || (isEmptyScalar(a) && isEmptyScalar(b));
}

/**
 * Like `isEqualTreatingEmptyAlike`, with a control's own notion of empty, e.g. rich text without visible text.
 */
export function isEqualTreatingEmptyAs(isEmpty: (value: unknown) => boolean): (a: unknown, b: unknown) => boolean {
    return (a, b) => a === b || (isEmpty(a) && isEmpty(b));
}
