"use client";

import type { ShouldRevalidateFunctionArgs } from "react-router";

/**
 * The header and the footer of the language layout only change with the language, so client navigations within a language only
 * render the page, like the layouts of Next.js. Submissions and revalidations after a server function still render the layout.
 */
export function shouldRevalidate({ currentParams, nextParams, formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
    if (formMethod || currentParams.language !== nextParams.language) {
        return defaultShouldRevalidate;
    }
    return false;
}
