// Content scopes are flat objects of primitive values, so their sorted entries form a stable string key.
// Deduplicating by that key keeps the first occurrence of each scope in a single pass.
export function deduplicateContentScopes<Scope extends Record<string, unknown>>(scopes: Scope[]): Scope[] {
    const seen = new Map<string, Scope>();
    for (const scope of scopes) {
        const key = JSON.stringify(Object.entries(scope).sort(([a], [b]) => a.localeCompare(b)));
        if (!seen.has(key)) {
            seen.set(key, scope);
        }
    }
    return Array.from(seen.values());
}
