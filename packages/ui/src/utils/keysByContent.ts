/**
 * Stable React keys for items that have no identity of their own, such as log lines or key caps, derived from their content. Repeated
 * content is told apart by its occurrence, so an item keeps its key when items are added after it.
 */
export function keysByContent(contents: readonly string[]): string[] {
    const occurrences = new Map<string, number>();
    return contents.map((content) => {
        const occurrence = (occurrences.get(content) ?? 0) + 1;
        occurrences.set(content, occurrence);
        return `${occurrence}:${content}`;
    });
}
