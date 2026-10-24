import type { ErrorHandler } from "hono";

import { getNavigationErrorDigest, parseRedirectDigest } from "./navigation";
import { reportError } from "./reportError";

export const handleError: ErrorHandler = (error, c) => {
    const digest = getNavigationErrorDigest(error);
    const redirect = digest ? parseRedirectDigest(digest) : undefined;
    if (redirect) {
        return c.redirect(redirect.location, redirect.status);
    }
    reportError(error);
    return c.text("Internal Server Error", 500);
};
