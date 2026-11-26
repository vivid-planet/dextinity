export function getProductTagDisplayName(snapshot: Record<string, unknown>): string | undefined {
    return typeof snapshot.title === "string" ? snapshot.title : undefined;
}
