export function getProductHighlightDisplayName(snapshot: Record<string, unknown>): string | undefined {
    return typeof snapshot.description === "string" ? snapshot.description : undefined;
}
