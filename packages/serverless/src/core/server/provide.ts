import type { Context, Env, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

/**
 * Registers a value in the request context, where routes and other modules read it from `c.var[key]`.
 *
 * This is the Hono counterpart of a NestJS provider. The factory runs once per request because on Cloudflare Workers, I/O objects
 * (e.g. database connections) and bindings (`c.env`) are bound to the request that created them and must not be shared.
 * `dispose` runs after the request was handled, the counterpart of `onModuleDestroy` for request-scoped providers.
 */
export function provide<TKey extends string, TValue, TEnv extends Env = Env>(
    key: TKey,
    factory: (c: Context<TEnv>) => TValue | Promise<TValue>,
    { dispose }: { dispose?: (value: TValue, c: Context<TEnv>) => void | Promise<void> } = {},
): MiddlewareHandler<TEnv & { Variables: { [K in TKey]: TValue } }> {
    return createMiddleware<TEnv & { Variables: { [K in TKey]: TValue } }>(async (c, next) => {
        const value = await factory(c as unknown as Context<TEnv>);
        c.set(key, value as never);
        try {
            await next();
        } finally {
            await dispose?.(value, c as unknown as Context<TEnv>);
        }
    });
}

/**
 * Reads a dependency another module provides. Fails with an error naming the missing provider, the counterpart of NestJS's
 * "Nest can't resolve dependencies" error, because Hono can't verify at compile time that the provider is registered.
 */
export function inject<T>(c: Context, key: string, requiredBy: string): T {
    const value = c.get(key as never) as T | undefined;
    if (value === undefined) {
        throw new Error(
            `${requiredBy} requires "${key}" in the request context. Register its provider with app.use() before mounting ${requiredBy}.`,
        );
    }
    return value;
}
