/**
 * Scope of a scoped entity (page tree node, DAM file, redirect, ...). The dimensions are defined by the application, so library code
 * can only treat a scope as an open record. Use `ContentScope` where the application's dimensions should be known.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScopeInterface = Record<string, any>;
