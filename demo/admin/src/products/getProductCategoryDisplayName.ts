export function getProductCategoryDisplayName(snapshot: Record<string, unknown>): string | undefined {
    return typeof snapshot.title === "string" ? snapshot.title : undefined;
}
