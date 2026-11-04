import type { VisibilityParam } from "@src/middleware/domainRewrite";
import type { ContentScope } from "@src/site-configs";
import { cache } from "react";

// https://github.com/vercel/next.js/discussions/43179#discussioncomment-11192893
/**
 * This is a workaround until Next.js adds support for true Server Context
 * It works by using React `cache` to store the value for the lifetime of one rendering.
 * Meaning it's available to all server components down the tree after it's set.
 * Do not use this unless necessary.
 *
 * @warning This is a temporary workaround.
 */
function createServerContext<T>(defaultValue: T): [() => T, (v: T) => void] {
    const getRef = cache(() => ({ current: defaultValue }));

    const getValue = (): T => getRef().current;

    const setValue = (value: T) => {
        getRef().current = value;
    };

    return [getValue, setValue];
}

export const [getNotFoundContext, setNotFoundContext] = createServerContext<ContentScope | null>(null);
export const [getVisibilityParam, setVisibilityParam] = createServerContext<VisibilityParam>("default");
