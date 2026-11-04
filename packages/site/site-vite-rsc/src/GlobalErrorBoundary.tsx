"use client";
/* eslint-disable @calm/react-intl/missing-formatted-message, react/jsx-no-literals -- Replaces the whole document, outside of the site's providers like react-intl */

import { Component, type PropsWithChildren } from "react";

import { getNavigationErrorDigest } from "./navigation.js";
import { reportError } from "./reportError.js";

type Props = PropsWithChildren<{
    /** The boundary is reset when the key changes, e.g. after navigating to another page */
    resetKey: unknown;
    /**
     * Handles `notFound()` or `redirect()` called after the response started, e.g. inside a Suspense boundary
     *
     * @returns Whether it was handled, otherwise the error page is shown
     */
    onNavigationError: (digest: string) => boolean;
}>;

type State = {
    error?: "navigation" | "failed";
};

export class GlobalErrorBoundary extends Component<Props, State> {
    state: State = {};

    static getDerivedStateFromError(error: unknown): State {
        return { error: getNavigationErrorDigest(error) ? "navigation" : "failed" };
    }

    componentDidCatch(error: unknown) {
        const navigationDigest = getNavigationErrorDigest(error);
        if (!navigationDigest) {
            reportError(error);
        } else if (!this.props.onNavigationError(navigationDigest)) {
            this.setState({ error: "failed" });
        }
    }

    componentDidUpdate(previousProps: Props) {
        if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
            this.setState({ error: undefined });
        }
    }

    render() {
        if (this.state.error === "navigation") {
            return null; // Until the not found page or the redirect target is loaded
        }
        if (this.state.error === "failed") {
            // Replaces the whole document, as the root layout is rendered inside the boundary
            return (
                <html>
                    <head>
                        <title>Error</title>
                    </head>
                    <body>
                        <p>Something went wrong.</p>
                        <a href={window.location.href}>Reload page</a>
                    </body>
                </html>
            );
        }
        return this.props.children;
    }
}
