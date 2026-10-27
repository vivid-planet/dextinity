import { z } from "zod";

/** The application's scope as a zod schema, e.g. `z.object({ domain: z.string() })` */
export type ScopeSchema = z.ZodObject<Record<string, z.ZodString>>;

/**
 * Helpers for routes of a feature with an application-defined scope. Scope dimensions are passed as top-level query parameters
 * (`?domain=main&folderId=…`), so typed clients know which dimensions are required.
 */
export function createScopedQueryHelpers<TScopeSchema extends ScopeSchema>(scopeSchema: TScopeSchema) {
    type Scope = z.infer<TScopeSchema>;
    const dimensions = Object.keys(scopeSchema.shape);
    const hasScope = dimensions.length > 0;

    return {
        scopedQuery<TArgsSchema extends z.ZodObject>(argsSchema: TArgsSchema) {
            for (const key of Object.keys(argsSchema.shape)) {
                if (dimensions.includes(key)) {
                    throw new Error(`The scope dimension "${key}" collides with a query parameter of the routes.`);
                }
            }
            return z.object({ ...scopeSchema.shape, ...argsSchema.shape } as TScopeSchema["shape"] & TArgsSchema["shape"]);
        },

        /** Separates the scope dimensions from the other query parameters. The scope is `undefined` when the application has no scope. */
        splitScopedQuery<TArgsSchema extends z.ZodObject>(
            argsSchema: TArgsSchema,
            query: object,
        ): { scope: Scope | undefined; args: z.output<TArgsSchema> } {
            const values = query as Record<string, unknown>;
            const scope = Object.fromEntries(dimensions.map((key) => [key, values[key]])) as Scope;
            const args = Object.fromEntries(
                Object.keys(argsSchema.shape)
                    .map((key) => [key, values[key]])
                    .filter(([, value]) => value !== undefined),
            );
            return { scope: hasScope ? scope : undefined, args: args as z.output<TArgsSchema> };
        },

        nonEmptyScopeOrNothing(scope: Record<string, string> | undefined): Scope | undefined {
            return hasScope ? (scope as Scope) : undefined;
        },
    };
}
