declare global {
    var reportedErrors: string[] | undefined;
}

export function reportError(error: unknown) {
    console.error(error);
    globalThis.reportedErrors ??= [];
    globalThis.reportedErrors.push(error instanceof Error ? error.message : String(error));
}
